"""Scientific/export checks; source-model data is not needed for these tests."""
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest

import numpy as np
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('export_examples', ROOT / 'scripts/export_examples.py')
exporter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(exporter)


class ExampleTests(unittest.TestCase):
    def test_alignment_crop_and_mismatch(self):
        target = np.arange(2000, dtype=float) / 2000
        tracks, common, difference = exporter.align_and_crop(
            target, target + 0.1, target[1:], target[1:] + 0.2, 100, 512)
        self.assertEqual(common, 1999)
        self.assertEqual(difference, 0)
        np.testing.assert_array_equal(tracks[0], target[101:613])
        np.testing.assert_allclose(tracks[1] - tracks[0], 0.1)
        with self.assertRaisesRegex(ValueError, 'do not match'):
            exporter.align_and_crop(target, target, target[:-1], target[:-1], 0, 512)
        with self.assertRaisesRegex(ValueError, 'exceeds'):
            exporter.align_and_crop(target, target, target[1:], target[1:], 1600, 512)

    def test_shared_gain_and_pcm_roundtrip(self):
        t = np.arange(16000)
        target = np.sin(2 * np.pi * t / 73) * 0.1
        streams = [target, 2 * target, 0.5 * target]
        with tempfile.TemporaryDirectory() as directory:
            decoded, tracks, gain = exporter.export_audio(streams, Path(directory), 'test')
            for original, actual, track in zip(streams, decoded, tracks):
                self.assertLessEqual(np.max(np.abs(original * gain - actual)), 0.5 / 32768 + 1e-15)
                self.assertLessEqual(track['peak'], 0.95)
            self.assertAlmostEqual(tracks[1]['peak'] / tracks[0]['peak'], 2, places=3)
            self.assertAlmostEqual(tracks[2]['peak'] / tracks[0]['peak'], 0.5, places=3)
            self.assertNotIn('metrics', tracks[0])

    def test_audio_input_validation(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'bad.wav'
            for rate, values in [(8000, np.ones(1000, dtype=np.int16)),
                                 (16000, np.ones((1000, 2), dtype=np.int16)),
                                 (16000, np.full(1000, np.nan, dtype=np.float32))]:
                wavfile.write(path, rate, values)
                with self.assertRaises(ValueError):
                    exporter.read_audio(path)

    def test_shared_spectrogram_reference(self):
        tone = np.sin(2 * np.pi * 1000 * np.arange(16000) / 16000)
        freq, times, panels, reference = exporter.spectrograms([tone, tone / 10, tone / 100])
        self.assertEqual((freq[0], freq[-1]), (0, 8000))
        self.assertEqual(len(freq), 513)
        self.assertAlmostEqual(times[0], 256 / 16000)
        self.assertAlmostEqual(times[1] - times[0], 128 / 16000)
        self.assertAlmostEqual(reference, 0.5)
        np.testing.assert_allclose([x.max() for x in panels], [0, -20, -40], atol=1e-10)

    def test_published_assets_and_independent_metrics(self):
        folder = ROOT / 'public/examples'
        text = (folder / 'metadata.json').read_text()
        metadata = json.loads(text)
        for private_prefix in ('/datapool/', '/home/', '/tmp/', 'result_dir', 'checkpoint'):
            self.assertNotIn(private_prefix, text)
        self.assertEqual(metadata['metric_implementation_sha256'], exporter.sha256(ROOT / 'public/hamai.py'))
        expected = {'speech': (64000, [-17.02, -38.93]), 'noise': (47995, [-18.42, -42.59])}
        for example in metadata['examples']:
            count, rounded = expected[example['id']]
            self.assertEqual(example['samples'], count)
            self.assertEqual(example['alignment']['target_max_abs_difference'], 0)
            self.assertEqual([m['advance_samples'] for m in example['models']], [4, 5])
            self.assertEqual(example['figure']['color_limits_db'], [-80, 0])
            signals = []
            for track in example['tracks']:
                path = folder / track['file']
                fs, pcm = wavfile.read(path)
                self.assertEqual(fs, 16000)
                self.assertEqual(pcm.dtype, np.int16)
                self.assertEqual(pcm.shape, (count,))
                self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), track['sha256'])
                signals.append(pcm.astype(float) / 32768)
                self.assertEqual(np.max(np.abs(signals[-1])), track['peak'])
                self.assertLessEqual(track['peak'], 0.95)
            target = signals[0]
            n = np.arange(count)
            # Independent full waveform-matrix fit, not the phase-statistics implementation.
            templates = target[:, None] * np.column_stack([
                np.cos(np.pi * n / 2), np.sin(np.pi * n / 2), np.cos(np.pi * n)])
            gram = templates.T @ templates
            alpha = 1e-6 * max(np.trace(gram) / 3, 1e-12)
            for i in (1, 2):
                error = target - signals[i]
                coeff = np.linalg.solve(gram + alpha * np.eye(3), templates.T @ error)
                mirror = templates @ coeff
                em, ee, et = mirror @ mirror, error @ error, target @ target
                db = 10 * np.log10((em + 1e-12) / (ee + 1e-12))
                metric = example['tracks'][i]['metrics']
                self.assertAlmostEqual(db, metric['hamai_error_db'], places=8)
                self.assertAlmostEqual(10 * np.log10(ee / et), metric['nmse_db'], places=10)
                for name, value in [('mirror_energy', em), ('error_energy', ee), ('target_energy', et)]:
                    np.testing.assert_allclose(metric[name], value, rtol=1e-9)
                self.assertTrue(metric['valid'])
                self.assertEqual(metric['status'], 'ok')
                self.assertEqual(round(db, 2), rounded[i - 1])
            base, full = [t['metrics'] for t in example['tracks'][1:]]
            self.assertGreater(base['hamai_error_db'] - full['hamai_error_db'], 10)
            self.assertLess(full['nmse_db'], base['nmse_db'])
            self.assertNotIn('metrics', example['tracks'][0])
            *_, reference = exporter.spectrograms(signals)
            self.assertEqual(reference, example['figure']['amplitude_reference'])
            figure = folder / example['figure']['file']
            self.assertEqual(exporter.sha256(figure), example['figure']['sha256'])
            # PNG IHDR stores dimensions at byte offsets 16 and 20.
            png = figure.read_bytes()
            self.assertEqual(int.from_bytes(png[16:20], 'big'), example['figure']['width'])
            self.assertEqual(int.from_bytes(png[20:24], 'big'), example['figure']['height'])
            for source in example['sources']:
                self.assertEqual(len(source['sha256']), 64)
                self.assertFalse(Path(source['dataset_file']).is_absolute())


if __name__ == '__main__':
    unittest.main()
