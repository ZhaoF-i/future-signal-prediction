# HA-MAI — Supplementary material

An English paper supplement explaining the **Hop-Adaptive Mirror Artifact Index**, using exactly:

$$\mathrm{HA\!\text{-}\!MAI}_{\mathrm{error}}=10\log_{10}\frac{E_m+\epsilon}{E_e+\epsilon}.$$

The denominator is total prediction-error energy, **not target energy**.
The page covers the complete non-DC basis, scaled ridge fitting, score interpretation, zero-error behavior, reference boundary experiments, and equal-weight per-unit dB reporting. All eight numbered equations are typeset at build time as self-contained SVG using MathJax with STIX2 glyphs. Inline math retains the local STIX Two Math font. Equations (S1)–(S5) follow the reference guide’s calculation steps with typeset fractions, subscripts, matrix products and squared L2 norms; (S5) does not expand the energies into summations. No browser-side equation renderer or external formula CDN is required.

## Local development

Requires Node.js >= 22.13.0.

```sh
npm ci --ignore-scripts
npm run dev
```

## Static build

```sh
npm run build
```

Equation sources are maintained as LaTeX in `math/equations.json`. `npm run math` generates the SVG assets and size metadata; both `npm run dev` and `npm run build` run this step automatically. The renderer follows the [MathJax server-side component workflow](https://docs.mathjax.org/en/v4.0/server/components.html) and uses its [STIX2 font support](https://docs.mathjax.org/en/v4.0/output/fonts.html).

The complete public website is exported to `dist/client/`. The build converts asset URLs to relative paths and removes unnecessary hydration scripts from the fully rendered article. Native equation links and downloads work without JavaScript, including under `/future-signal-prediction/`.

## GitHub Pages

Push this website directory as the root of the selected GitHub repository, with default branch `main`. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions**. The included workflow builds the portable static site and deploys the `dist/client/` artifact. For a different default branch, change the workflow push branch. GitHub Pages must be available for that repository/account.

Only this website project belongs in the website repository, including the six selected target/estimate excerpts, four derived error tracks, and their figures described below. Do not upload the surrounding paper workspace or bulk original audio datasets.

## Numerical verification

The download `public/hamai.py` requires NumPy and uses phase-wise sufficient statistics, consistent with the reference calculation (ridge=1e-6, eps=1e-12). It adds explicit input checks and sample-status reporting; it does not silently truncate unequal signals.

```sh
python tests/test_hamai.py
python -m unittest discover -s tests -p "test_summary.py"
```

Tests compare the implementation with full waveform-matrix fitting for periods 2, 3, 4, 8, and 16, and check scaling, exact-zero error, low error, silent targets, and invalid inputs.

The formula returns 0 dB for exact zero error. This must be reported as `no_error`, not interpreted as a high artifact share. `low_error` uses an explicit reporting convention of Ee <= 100 epsilon. A low HA-MAI value alone does not indicate good prediction quality.

## Data provenance

The reference experiment dated 2026-09-08 used 30 real clean targets (10 each from LibriSpeech, TIMIT, AISHELL-1), periods 2/4/8/16, and five fixed Gaussian seeds (20260908–20260912). The 720 saved per-record measurements were reaggregated on 2026-09-09 without regenerating audio or predictions. All 720 pass the energy/score audit and the existing validity thresholds: 120 periodic-error records and 600 Gaussian records; all exclusion counts are zero.

- `public/data/boundary-mean-summary.csv` contains the current per-unit dB means and counts, both for each corpus and for all records within each condition/period. Rows with `dataset=all` supply Table S1. Their `corpus_macro_mean_db` also reports the equal-weight corpus mean.
- `public/data/boundary-per-unit.csv` contains corpus labels, anonymous sample IDs, seeds, saved mirror/target/error energies, saved per-record dB scores, and audited statuses. IDs are assigned within each corpus and are consistent across periods, conditions, and seeds; `seed=-1` marks the deterministic periodic construction. This boundary experiment download contains no raw audio or private filesystem paths. The separate model examples below publish only the selected excerpts.
- `public/data/boundary-summary.csv` is retained unchanged **for historical reference only**. It uses the previous energy-pooling convention and does not supply the current webpage values.

These are boundary experiments, not a model leaderboard or a universal detection threshold. The Gaussian means for H=2/4/8/16 round to −56.81/−46.60/−37.92/−32.74 dB. Periodic means are slightly below 0 dB because of ridge shrinkage.

### Reproduce the summary

The summary script uses only the Python standard library. It accepts either the original `sample_metrics.csv` (with `target_path` and `error_share_db`) or the distributed anonymized CSV. It verifies each saved score against its saved energies with epsilon=1e-12 and an absolute tolerance of 1e-8 dB before including it in a mean. Invalid energies, nonfinite or inconsistent scores, and mirror energy exceeding error energy beyond numerical tolerance are counted as `invalid`. Duplicate record identities and malformed metadata stop the export. The existing single-record `hamai_error()` API and computation are unchanged.

```sh
python scripts/summarize_boundary.py \
  --input public/data/boundary-per-unit.csv \
  --output-dir /tmp/hamai-summary
```

This reproduces both current CSV files byte for byte. To process the original experiment, pass its `sample_metrics.csv` as `--input`; absolute input paths are replaced with anonymous sample IDs in the output. Summary rows include total/valid counts and separate invalid, silent-target, no-error, and low-error counts. Missing means are empty CSV cells, never zero placeholders. An empty input produces header-only files. Tests cover unequal error energies, corpus weighting, invalid/zero-valid groups, score audits, path removal, and reproduction of all 720 published records.

## Qualitative mirror suppression examples

Figures S1 and S2 use existing **H=4** Base and complete RandomInterval outputs selected from `hamai_full_24_branch/method_manifest.csv`; no inference is rerun and no fitted mirror component is subtracted. These are selected qualitative illustrations, not corpus averages or a claim that residual mirror energy is zero. The existing boundary table, S1–S8 equations, single-record implementation, and aggregation data are unchanged.

- **Speech:** LibriSpeech test-clean `7021-79759-0004`, 64000 samples (4 s) beginning at sample 176000 (11 s) of the aligned interval.
- **Noise:** DEMAND `NPARK_S00641_seg0015`, all 47995 common samples (2.9996875 s).

The baseline has advance **F=4** and the complete system **F=5**. Remove the first sample from both baseline target and prediction, then take the common valid interval with the full-system pair. Both selected pairs have exactly identical aligned targets before quantization. This is a comparison over the **same target time interval**, not a matched-advance ablation. The detector period remains H=4 for both models.

### Selection rule

The approved examples were chosen from paired saved outputs, using the unquantized audio. For each eligible speech target, examine 4 s windows with starts spaced by 16000 samples, also including the final possible start; choose the window with highest target energy, taking the earliest on a tie. Noise uses each entire common interval without padding, looping, or concatenation. Require valid metrics, baseline HA-MAI error above −20 dB, a decrease of at least 10 dB, and full-system NMSE no worse than baseline. Sort eligible candidates by HA-MAI reduction (with sample identifier as tie-breaker) and take the upper median at index `len(candidates)//2`: 88 eligible speech candidates and 15 eligible noise candidates (from 54 paired DEMAND targets). This selection deliberately favors visible mirror suppression and cannot establish typical performance. The exporter reproduces the **fixed selected clips**, rather than rerunning this search.

### Audio, spectra, and metrics

Within each example, all three tracks receive one gain derived from their joint peak. The largest PCM16 level at or below 0.95 is used as the peak limit. No per-track loudness adjustment, DC removal, resampling, or additional filtering is performed. Quantize with `round(gain*x*32768)` and decode with `int16/32768`. HA-MAI error and NMSE are recomputed on the decoded **published WAVs**, so playback, plots, and displayed numbers refer to the same signals. Target is a reference and has no reported zero-error HA-MAI score. NMSE is `10*log10(error_energy/target_energy)` without an additional fitted gain; both selected predictions have valid, nonzero energies.

Every figure uses a periodic Hann window of 512 samples, a hop of 128, and an FFT of 1024 at 16 kHz, with no boundary extension or padded final frame. STFT magnitudes use SciPy's `spectrum` scaling. The maximum magnitude across all three exported tracks is their **shared reference**; `20*log10(magnitude/reference)` is floored at −80 dB. All panels share the 0–8 kHz frequency range, time interval, and −80 to 0 dB color scale. The figures use STIX lettering; the webpage retains its local STIX Two fonts. Native audio controls need no JavaScript and do not autoplay.

`public/examples/metadata.json` is the single source of the webpage's clip metrics. It records source dataset identifiers, model methods/advances/commits, source WAV and manifest SHA-256 hashes, alignment and crop ranges (zero-based, end-exclusive), sample counts, shared gains, exported peaks/hashes, metric energies/parameters/statuses, spectrogram settings, and software versions. Private absolute paths and model checkpoints are not published.

### Reproduce the media

Each example now also includes a two-row **prediction-error** spectrogram and two error players, under panel (b) of Figure S1 or S2. Error means **published target − published estimate**, including all prediction error, not just the fitted mirror component. Subtraction uses PCM16 sample integers promoted to int32 to avoid overflow, then exports an exact PCM16 difference. No extra gain, normalization, clipping, or inference is applied. These selected residuals fit PCM16; the exporter rejects overflow rather than silently clipping. The target/estimate peak limit remains 0.95; error peaks are recorded separately (the speech baseline residual reaches approximately 0.952). The original six WAVs, displayed metrics, and target/estimate figures are unchanged.

Error spectrograms use exactly the same STFT parameters, magnitude reference, and −80 to 0 dB color limits as the corresponding target/estimate figure. Error energies match the error-energy values used in the displayed HA-MAI and NMSE. Metadata records the residual definition, parent WAV identifiers, gain of 1, hashes, peaks, energies, and plotting parameters.

Reproduce the added error media using **only the published files**, without the private manifest or model outputs:

```sh
python scripts/export_examples.py --from-published --output-dir public/examples
```

Requires Python with NumPy, SciPy, and Matplotlib; the exact export versions are recorded in the metadata. From the repository root, provide the existing manifest, whose `result_dir` entries must point to locally accessible saved WAVs:

```sh
python scripts/export_examples.py \
  --manifest /path/to/hamai_full_24_branch/method_manifest.csv \
  --output-dir public/examples
python -m unittest discover -s tests -p 'test_examples.py'
npm run build
```

The full export verifies sampling rates, finite mono data, manifest advances, target agreement, crop bounds, and metric validity. It emits ten WAVs, four PNGs, and metadata. Existing media credits are maintained separately. The committed assets allow normal website builds without Python or access to the source datasets. Tests independently verify final PCM16 metrics/energies, exact error subtraction, overflow rejection, shared-gain quantization, alignment rejection, common spectrogram normalization, asset hashes, and the published example conditions.

### Dataset credits

LibriSpeech: Vassil Panayotov, Guoguo Chen, Daniel Povey, and Sanjeev Khudanpur, ICASSP 2015; [OpenSLR 12](https://www.openslr.org/12/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). DEMAND: Joachim Thiemann, Nobutaka Ito, and Emmanuel Vincent, version 1.0 (2013), [DOI 10.5281/zenodo.1227121](https://zenodo.org/records/1227121); the original dataset description specifies [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/). The selected media retain those notices; see [media attribution and processing changes](public/examples/ATTRIBUTION.md).

## Implementation details

The webpage uses `x` for the target and `H` for the nominal detection period. These correspond to `target` and `period` in `hamai_error`. The CSV's `period` column has the same meaning. The page defines `e = target - estimate`; the implementation uses the opposite sign, which changes the fitted coefficients' signs but leaves energies and HA-MAI values unchanged.

### Phase-wise sufficient statistics

Let `B` contain the complete non-DC Fourier basis evaluated over one period. For each phase `r = n mod H`, accumulate

$$S_{xx}[r]=\sum_{n\bmod H=r}x[n]^2,\qquad S_{xe}[r]=\sum_{n\bmod H=r}x[n]e[n].$$

The ridge system can then be formed without constructing the waveform-length template matrix:

$$G=B^\top\operatorname{diag}(S_{xx})B,\qquad h=B^\top S_{xe}.$$

Solve `(G + alpha I)c = h` with `alpha = ridge * max(trace(G)/(H-1), eps)`, then compute mirror energy as `c.T @ G @ c`. For `H=16`, this is a 15-by-15 system. With nonzero ridge, fitted energy is not exactly the reduction in residual energy of an orthogonal least-squares fit.

### Linear fraction and dB conversion

The auxiliary fraction is

$$F=\frac{E_m}{E_e+\epsilon}.$$

Because the dB definition also adds epsilon to the numerator, its exact relation to the fraction is

$$\mathrm{HA\!\text{-}\!MAI}_{\mathrm{error}}=10\log_{10}\left(F+\frac{\epsilon}{E_e+\epsilon}\right).$$

It is only approximately `10*log10(F)` when stabilization is negligible. For fixed error energy, the lower bound is `10*log10(eps/(Ee+eps))`; there is no finite lower bound independent of error energy. At exact zero error, the fraction is zero but the stipulated dB formula returns zero dB.

### Input status and usage

```python
from hamai import hamai_error

result = hamai_error(target, estimate, period=4)
print(result["hamai_error_db"])
print(result["status"])
```

The function rejects unequal lengths, non-finite inputs, complex waveforms, and invalid periods. It does not automatically align, truncate, resample, or remove DC. Status is `silent_target` when target energy is at most epsilon; otherwise it is `no_error` for exact zero error, `low_error` when error energy is at most `100*eps`, or `ok`. The `100*eps` threshold is a reporting convention, not part of the metric formula. Interpret the ratio for `ok` samples and document any exclusions and their counts.

### Aggregation conventions

Fit and score each evaluation record independently:

$$d_i=10\log_{10}\frac{E_{m,i}+\epsilon}{E_{e,i}+\epsilon},\qquad D_c=\frac{1}{N_c}\sum_{i\in c}d_i.$$

Here the sum runs over the corpus's valid records only, and `N_c` is their count. There is no audio-length or error-energy weighting. Apply the existing status precedence: invalid measurements first, then silent target, exact zero error, low error, and `ok`. Count exclusions separately and average only `ok` scores. A corpus with no valid records has an unavailable score, not 0 dB.

For a domain macro over `C` specified corpora, use

$$D_{\mathrm{macro}}=\frac{1}{C}\sum_{c=1}^{C}D_c.$$

If any included corpus has no valid records, the macro remains unavailable; do not silently drop it. Table S1 averages all valid records for each condition and period: one record per target for periodic error, and one per target × seed for Gaussian prediction. All records have equal weight. Because the experiment has equal valid counts in each corpus, the table mean also equals the corpus macro; this equality does not hold in general for unbalanced corpora.

For an individual record only, −10/−20/−30 dB indicate approximately 10%/1%/0.1% mirror shares when stabilization is negligible. Averaging dB corresponds to the **geometric mean of stabilized energy ratios**, not an arithmetic mean of mirror percentages:

$$10^{D_c/10}=\left(\prod_{i\in c}\frac{E_{m,i}+\epsilon}{E_{e,i}+\epsilon}\right)^{1/N_c}.$$

This supplement defines the **error-normalized variant only**. A target-normalized HA-MAI has a different denominator and interpretation. Existing target-normalized manuscript scores cannot be relabeled as error-normalized scores without verifying or recomputing their underlying energies and aggregation.
