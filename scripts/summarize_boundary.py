"""Audit saved per-unit energies and export equal-weight dB summaries (stdlib only)."""
import argparse
import csv
import math
from collections import defaultdict
from pathlib import Path

EPS = 1e-12
STATUSES = ('ok', 'invalid', 'silent_target', 'no_error', 'low_error')
UNIT_FIELDS = ('case', 'period', 'dataset', 'sample_id', 'seed', 'mirror_energy',
               'target_energy', 'error_energy', 'hamai_error_db', 'status', 'reason')
SUMMARY_FIELDS = ('case', 'period', 'dataset', 'record_count', 'valid_count',
                  'invalid_count', 'silent_target_count', 'no_error_count',
                  'low_error_count', 'mean_db', 'corpus_macro_mean_db')


def audit_rows(source):
    """Accept original experiment CSV or this script's anonymized per-unit CSV."""
    source = list(source)
    identities = defaultdict(set)
    for row in source:
        if not row.get('sample_id'):
            identities[row['dataset']].add(row['target_path'])
    aliases = {(dataset, identity): f'sample_{i:03d}'
               for dataset, values in identities.items()
               for i, identity in enumerate(sorted(values), 1)}
    result, seen = [], set()
    for row in source:
        sample = row.get('sample_id') or aliases[row['dataset'], row['target_path']]
        if any('/' in v or '\\' in v for v in (sample, row['dataset'], row['case'])):
            raise ValueError('Metadata must be labels, not filesystem paths')
        unit = dict(case=row['case'], period=int(row['period']), dataset=row['dataset'],
                    sample_id=sample, seed=int(row['seed']))
        if unit['period'] < 2:
            raise ValueError('Period must be at least 2')
        key = tuple(unit.values())
        if key in seen:
            raise ValueError(f'Duplicate evaluation record: {key}')
        seen.add(key)
        status, reason = 'ok', ''
        try:
            em, et, ee = (float(row[k]) for k in
                          ('mirror_energy', 'target_energy', 'error_energy'))
            score = float(row.get('hamai_error_db', row.get('error_share_db', 'nan')))
            if not all(math.isfinite(v) and v >= 0 for v in (em, et, ee)):
                raise ValueError('invalid_energy')
            # Log difference avoids overflow/underflow for extreme energy ratios.
            expected = 10 * (math.log10(em + EPS) - math.log10(ee + EPS))
            if not math.isfinite(score) or not math.isclose(score, expected, abs_tol=1e-8, rel_tol=0):
                raise ValueError('score_energy_mismatch')
            if em > ee + max(EPS, ee * 1e-8):
                raise ValueError('mirror_energy_exceeds_error')
            if et <= EPS:
                status = 'silent_target'
            elif ee == 0:
                status = 'no_error'
            elif ee <= 100 * EPS:
                status = 'low_error'
        except (ValueError, OverflowError) as exc:
            status, reason = 'invalid', str(exc)
        # Keep the saved values; the audit checks scores before any averaging.
        for name in ('mirror_energy', 'target_energy', 'error_energy'):
            unit[name] = row[name]
        unit.update(hamai_error_db=row.get('hamai_error_db', row.get('error_share_db', '')),
                    status=status, reason=reason)
        result.append(unit)
    return sorted(result, key=lambda r: (r['case'], r['period'], r['dataset'], r['sample_id'], r['seed']))


def mean_db(rows):
    scores = [float(r['hamai_error_db']) for r in rows if r['status'] == 'ok']
    return math.fsum(scores) / len(scores) if scores else None


def summarize(rows):
    conditions = defaultdict(list)
    for row in rows:
        conditions[row['case'], row['period']].append(row)
    output = []
    for (case, period), units in sorted(conditions.items()):
        corpora = defaultdict(list)
        for row in units:
            corpora[row['dataset']].append(row)
        means = [mean_db(group) for group in corpora.values()]
        macro = math.fsum(means) / len(means) if all(m is not None for m in means) else None
        for dataset, group in [('all', units), *sorted(corpora.items())]:
            counts = {s: sum(r['status'] == s for r in group) for s in STATUSES}
            output.append(dict(case=case, period=period, dataset=dataset,
                               record_count=len(group), valid_count=counts['ok'],
                               **{f'{s}_count': counts[s] for s in STATUSES if s != 'ok'},
                               mean_db=mean_db(group),
                               corpus_macro_mean_db=macro if dataset == 'all' else None))
    return output


def write_csv(path, fields, rows):
    with path.open('w', newline='', encoding='utf-8') as handle:
        writer = csv.DictWriter(handle, fieldnames=fields, lineterminator='\n')
        writer.writeheader()
        writer.writerows(rows)


def export(input_path, output_dir):
    with Path(input_path).open(newline='', encoding='utf-8') as handle:
        rows = audit_rows(csv.DictReader(handle))
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    write_csv(output_dir / 'boundary-per-unit.csv', UNIT_FIELDS, rows)
    write_csv(output_dir / 'boundary-mean-summary.csv', SUMMARY_FIELDS, summarize(rows))
    return rows


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', type=Path, required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    args = parser.parse_args()
    records = export(args.input, args.output_dir)
    print(', '.join(f'{status}={sum(r["status"] == status for r in records)}' for status in STATUSES))
