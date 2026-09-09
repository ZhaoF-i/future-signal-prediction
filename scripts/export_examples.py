#!/usr/bin/env python3
"""Export the two fixed qualitative examples from saved Base/RandomInterval WAVs.

No model inference or waveform correction is performed. See README for selection.
Only the input manifest may contain private paths; published metadata never does.
"""
import argparse
import csv
import hashlib
import json
from pathlib import Path
import sys

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import scipy
from scipy.io import wavfile
from scipy.signal import stft

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'public'))
from hamai import hamai_error

FS = 16000
LABELS = ('Target', 'Baseline', 'After mirror suppression')
ROLES = ('target', 'baseline', 'suppressed')
SPECS = (
    dict(id='speech', domain='Speech', dataset='LibriSpeech test-clean',
         sample_id='7021-79759-0004', folder='librispeech_test_clean_audio',
         filename='7021__79759__7021-79759-0004_flac_target_speech.wav',
         start=176000, samples=64000, eligible_count=88,
         source_url='https://www.openslr.org/12/',
         attribution='Vassil Panayotov, Guoguo Chen, Daniel Povey, and Sanjeev Khudanpur; LibriSpeech (2015), derived from LibriVox recordings.',
         license='CC BY 4.0', license_url='https://creativecommons.org/licenses/by/4.0/'),
    dict(id='noise', domain='Noise', dataset='DEMAND',
         sample_id='NPARK_S00641_seg0015', folder='demand_audio',
         filename='demand_NPARK_S00641_seg0015_target_noise.wav',
         start=0, samples=47995, eligible_count=15,
         source_url='https://zenodo.org/records/1227121',
         attribution='Joachim Thiemann, Nobutaka Ito, and Emmanuel Vincent; DEMAND (2013), version 1.0.',
         license='CC BY-SA 3.0', license_url='https://creativecommons.org/licenses/by-sa/3.0/'),
)


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def read_audio(path):
    rate, values = wavfile.read(path)
    if rate != FS or values.ndim != 1 or len(values) < 4:
        raise ValueError('Expected a mono 16 kHz WAV with at least four samples')
    if values.dtype.kind == 'f':
        values = values.astype(np.float64)
    elif values.dtype == np.int16:
        values = values.astype(np.float64) / 32768
    else:
        raise ValueError('Only floating-point or PCM16 input is supported')
    if not np.isfinite(values).all():
        raise ValueError('Nonfinite waveform')
    return values


def align_and_crop(base_target, base_prediction, full_target, full_prediction, start, samples):
    if start < 0 or samples < 512:
        raise ValueError('Invalid crop')
    streams = (base_target[1:], base_prediction[1:], full_target, full_prediction)
    common = min(map(len, streams))
    if start + samples > common:
        raise ValueError('Crop exceeds the common valid interval')
    difference = float(np.max(np.abs(streams[0][:common] - streams[2][:common])))
    if difference > 1e-6:
        raise ValueError('Aligned targets do not match')
    crop = slice(start, start + samples)
    return [streams[i][crop] for i in (2, 1, 3)], common, difference


def export_audio(streams, output_dir, prefix):
    peak = max(float(np.max(np.abs(x))) for x in streams)
    if not np.isfinite(peak) or peak <= 0:
        raise ValueError('Cannot normalize empty/silent/nonfinite audio')
    # Use the largest PCM16 level at or below 0.95 so rounding cannot exceed it.
    gain = (np.floor(0.95 * 32768) / 32768) / peak
    decoded, tracks = [], []
    for role, label, values in zip(ROLES, LABELS, streams):
        filename = f'{prefix}-{role}.wav'
        pcm = np.rint(values * gain * 32768).astype(np.int16)
        wavfile.write(output_dir / filename, FS, pcm)
        audio = read_audio(output_dir / filename)
        decoded.append(audio)
        tracks.append(dict(role=role, label=label, file=filename,
                           sha256=sha256(output_dir / filename),
                           samples=len(audio), peak=float(np.max(np.abs(audio)))))
    for index in (1, 2):
        result = hamai_error(decoded[0], decoded[index], period=4)
        if not result['valid']:
            raise ValueError('Exported prediction is not a valid metric record')
        result['nmse_db'] = float(10 * np.log10(result['error_energy'] / result['target_energy']))
        tracks[index]['metrics'] = result
    return decoded, tracks, float(gain)


def spectrograms(streams):
    amplitudes = []
    for audio in streams:
        freq, times, z = stft(audio, fs=FS, window='hann', nperseg=512,
                              noverlap=384, nfft=1024, boundary=None, padded=False)
        amplitudes.append(np.abs(z))
    reference = float(max(x.max() for x in amplitudes))
    if reference <= 0:
        raise ValueError('Silent spectrogram')
    db = [20 * np.log10(np.maximum(x / reference, 1e-4)) for x in amplitudes]
    return freq, times, db, reference


def plot_example(streams, path):
    freq, times, panels, reference = spectrograms(streams)
    plt.rcParams.update({'font.family': 'STIXGeneral', 'mathtext.fontset': 'stix',
                         'font.size': 12, 'axes.titlesize': 13})
    fig, axes = plt.subplots(3, 1, figsize=(9, 6.8), sharex=True, sharey=True)
    fig.subplots_adjust(left=0.095, right=0.875, top=0.95, bottom=0.095, hspace=0.3)
    for ax, label, panel in zip(axes, LABELS, panels):
        # Frame centers are 16 ms from the boundaries; do not add synthetic frames.
        mesh = ax.pcolormesh(times, freq / 1000, panel, shading='auto',
                             cmap='magma', vmin=-80, vmax=0, rasterized=True)
        ax.set_title(label, loc='left', pad=5)
        ax.set_ylabel('Frequency (kHz)')
        ax.set_ylim(0, 8)
        ax.set_yticks([0, 2, 4, 6, 8])
        ax.set_xlim(0, len(streams[0]) / FS)
        ax.tick_params(labelsize=11)
    axes[-1].set_xlabel('Time within excerpt (s)')
    bar = fig.colorbar(mesh, cax=fig.add_axes([0.899, 0.15, 0.025, 0.74]),
                       ticks=[-80, -60, -40, -20, 0])
    bar.set_label('Magnitude (dB relative to shared reference)')
    fig.savefig(path, dpi=180, metadata={'Software': 'Matplotlib'})
    plt.close(fig)
    return dict(file=path.name, sha256=sha256(path), width=1620, height=1224,
                amplitude_reference=reference, reference='Maximum STFT magnitude across all three exported WAVs',
                window='periodic Hann', window_samples=512, hop_samples=128,
                fft_samples=1024, boundary=None, padded=False, scaling='spectrum',
                frequency_hz=[0, 8000], color_limits_db=[-80, 0], colormap='magma',
                normalization='20*log10(max(abs(STFT)/shared_reference, 1e-4))')


def export(manifest, output_dir):
    with manifest.open(newline='') as handle:
        rows = list(csv.DictReader(handle))
    output_dir.mkdir(parents=True, exist_ok=True)
    examples = []
    for spec in SPECS:
        sources, arrays, models = [], [], []
        for method, advance in [('Base', 4), ('RandomInterval', 5)]:
            matches = [r for r in rows if r['domain'] == spec['domain']
                       and r['period'] == '4' and r['method'] == method]
            if len(matches) != 1 or int(matches[0]['future']) != advance:
                raise ValueError('Expected one manifest row with the specified advance')
            row = matches[0]
            # Deliberately whitelist public model metadata, excluding workspace/checkpoint/result_dir.
            models.append(dict(method=method, advance_samples=advance, commit=row['commit']))
            for role in ('target', 'estimate'):
                filename = spec['filename'].replace('_target_', f'_{role}_')
                path = Path(row['result_dir']) / spec['folder'] / filename
                values = read_audio(path)
                arrays.append(values)
                sources.append(dict(method=method, role=role, dataset_file=f"{spec['folder']}/{filename}",
                                    sha256=sha256(path), samples=len(values)))
        streams, common, difference = align_and_crop(*arrays, spec['start'], spec['samples'])
        decoded, tracks, gain = export_audio(streams, output_dir, spec['id'])
        figure = plot_example(decoded, output_dir / f"{spec['id']}-spectrogram.png")
        examples.append(dict(id=spec['id'], domain=spec['domain'], dataset=spec['dataset'],
            sample_id=spec['sample_id'], period=4, sample_rate=FS, samples=spec['samples'],
            duration_seconds=spec['samples'] / FS, models=models, sources=sources,
            dataset_credit={k: spec[k] for k in ('source_url', 'attribution', 'license', 'license_url')},
            alignment=dict(base_trim_start_samples=1, full_trim_start_samples=0,
                common_samples=common, target_max_abs_difference=difference,
                crop_start_sample=spec['start'], crop_end_sample_exclusive=spec['start'] + spec['samples'],
                crop_origin='Common interval after alignment; zero-based',
                comparison='Same target time interval, not a matched-advance ablation'),
            selection=dict(purpose='Selected qualitative illustration, not a population average',
                eligible_count=spec['eligible_count'], rank_rule='Upper median HA-MAI reduction among eligible candidates',
                baseline_hamai_above_db=-20, minimum_reduction_db=10, require_nmse_improvement=True),
            audio=dict(format='PCM16 WAV', shared_gain=gain, peak_limit=0.95,
                quantization='round(gain*x*32768); decode as int16/32768; no dither',
                changes='Time alignment, excerpt selection, one shared gain, PCM16 quantization; predictions are saved model outputs'),
            tracks=tracks, figure=figure))
    metadata = dict(schema_version=1, manifest_sha256=sha256(manifest),
        metric_implementation_sha256=sha256(ROOT / 'public' / 'hamai.py'),
        metric_input='Decoded published PCM16 WAVs, independently fitted per prediction',
        nmse_definition='10*log10(sum((prediction-target)**2)/sum(target**2))',
        software=dict(numpy=np.__version__, scipy=scipy.__version__, matplotlib=matplotlib.__version__),
        examples=examples)
    (output_dir / 'metadata.json').write_text(json.dumps(metadata, indent=2, allow_nan=False) + '\n')
    return metadata


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, default=ROOT / 'public' / 'examples')
    args = parser.parse_args()
    metadata = export(args.manifest, args.output_dir)
    for example in metadata['examples']:
        print(example['id'], {t['role']: t.get('metrics', {}).get('hamai_error_db') for t in example['tracks']})
