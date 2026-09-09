"""Regression checks for the aggregation convention and published data."""
import csv
import importlib.util
import math
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('summary', ROOT / 'scripts/summarize_boundary.py')
m = importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)


def unit(sample, em, ee, et=10, dataset='a'):
    score = 10 * math.log10((em + m.EPS) / (ee + m.EPS))
    return dict(case='test', period=4, dataset=dataset, target_path=f'/private/audio/{sample}.wav',
                seed=1, mirror_energy=em, target_energy=et, error_energy=ee, error_share_db=score)


class SummaryTests(unittest.TestCase):
    def test_equal_record_weights_not_energy_pooling(self):
        rows = m.audit_rows([unit('one', .1, 1), unit('two', 1, 100)])
        result = m.summarize(rows)[0]
        self.assertAlmostEqual(result['mean_db'], -15, places=8)
        pooled = 10 * math.log10((1.1 + m.EPS) / (101 + m.EPS))
        self.assertGreater(abs(result['mean_db'] - pooled), 4)

    def test_corpus_macro_differs_with_unbalanced_counts(self):
        rows = m.audit_rows([unit('one', .1, 1), unit('two', .1, 1),
                             unit('three', .01, 1, dataset='b')])
        result = m.summarize(rows)[0]
        self.assertAlmostEqual(result['mean_db'], -40 / 3, places=8)
        self.assertAlmostEqual(result['corpus_macro_mean_db'], -15, places=8)

    def test_statuses_and_unavailable_mean(self):
        bad = unit('bad', .1, 1)
        bad['error_share_db'] = 99
        nonfinite = unit('nonfinite', .1, 1)
        nonfinite['error_energy'] = float('nan')
        negative = unit('negative', .1, 1)
        negative['mirror_energy'] = -1
        rows = m.audit_rows([bad, nonfinite, negative, unit('silent', 0, 0, et=0),
                             unit('zero', 0, 0), unit('low', 0, 100 * m.EPS)])
        result = m.summarize(rows)[0]
        self.assertEqual(result['invalid_count'], 3)
        for status in ('silent_target', 'no_error', 'low_error'):
            self.assertEqual(result[status + '_count'], 1)
        self.assertIsNone(result['mean_db'])
        self.assertIsNone(result['corpus_macro_mean_db'])
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'summary.csv'
            m.write_csv(path, m.SUMMARY_FIELDS, [result])
            with path.open() as f:
                self.assertEqual(next(csv.DictReader(f))['mean_db'], '')
        self.assertEqual(m.summarize([]), [])

    def test_missing_valid_corpus_blocks_macro(self):
        result = m.summarize(m.audit_rows([unit('valid', .1, 1), unit('zero', 0, 0, dataset='b')]))[0]
        self.assertIsNotNone(result['mean_db'])
        self.assertIsNone(result['corpus_macro_mean_db'])

    def test_anonymization_and_duplicates(self):
        original = [unit('one', .1, 1), unit('two', 1, 100)]
        rows = m.audit_rows(original)
        self.assertNotIn('/private', str(rows))
        self.assertNotIn('target_path', rows[0])
        self.assertEqual(len({r['sample_id'] for r in rows}), 2)
        with self.assertRaises(ValueError):
            m.audit_rows([original[0], original[0]])

    def test_published_data_and_reproduction(self):
        source = ROOT / 'public/data/boundary-per-unit.csv'
        with tempfile.TemporaryDirectory() as tmp:
            rows = m.export(source, tmp)
            self.assertEqual(len(rows), 720)
            self.assertTrue(all(r['status'] == 'ok' for r in rows))
            for name in ('boundary-per-unit.csv', 'boundary-mean-summary.csv'):
                self.assertEqual((Path(tmp) / name).read_bytes(), (source.parent / name).read_bytes())
            table = [r for r in m.summarize(rows) if r['dataset'] == 'all']
            expected = {2: '-56.81', 4: '-46.60', 8: '-37.92', 16: '-32.74'}
            for row in table:
                if row['case'] == 'rms_matched_gaussian_prediction':
                    self.assertEqual(f"{row['mean_db']:.2f}", expected[row['period']])
                    self.assertEqual(row['valid_count'], 150)
                else:
                    self.assertLess(abs(row['mean_db']), .00002)
                    self.assertEqual(row['valid_count'], 30)
                self.assertAlmostEqual(row['mean_db'], row['corpus_macro_mean_db'], places=10)


if __name__ == '__main__':
    unittest.main()
