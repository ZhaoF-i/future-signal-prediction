# HA-MAI — Supplementary material

An English paper supplement explaining the **Hop-Adaptive Mirror Artifact Index**, using exactly:

$$\mathrm{HA\!\text{-}\!MAI}_{\mathrm{error}}=10\log_{10}\frac{E_m+\epsilon}{E_e+\epsilon}.$$

The denominator is total prediction-error energy, **not target energy**.
The page covers the complete non-DC basis, scaled ridge fitting, score interpretation, zero-error behavior, reference boundary experiments, and pooled reporting. Equations use native MathML and require no external formula CDN.

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

The complete public website is exported to `dist/client/`. The build converts asset URLs to relative paths and removes unnecessary hydration scripts from the fully rendered article. Native equation links and downloads work without JavaScript, including under `/future-signal-prediction/`.

## GitHub Pages

Push this website directory as the root of the selected GitHub repository, with default branch `main`. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions**. The included workflow builds the portable static site and deploys the `dist/client/` artifact. For a different default branch, change the workflow push branch. GitHub Pages must be available for that repository/account.

Only this website project belongs in the website repository. Do not upload the surrounding paper workspace or original audio datasets.

## Numerical verification

The download `public/hamai.py` requires NumPy and uses phase-wise sufficient statistics, consistent with the reference calculation (ridge=1e-6, eps=1e-12). It adds explicit input checks and sample-status reporting; it does not silently truncate unequal signals.

```sh
python tests/test_hamai.py
```

Tests compare the implementation with full waveform-matrix fitting for periods 2, 3, 4, 8, and 16, and check scaling, exact-zero error, low error, silent targets, and invalid inputs.

The formula returns 0 dB for exact zero error. This must be reported as `no_error`, not interpreted as a high artifact share. `low_error` uses an explicit reporting convention of Ee <= 100 epsilon. A low HA-MAI value alone does not indicate good prediction quality.

## Data provenance

`public/data/boundary-summary.csv` is the unchanged aggregate summary from the author's reference experiment dated 2026-09-08: 30 real clean targets (10 each from LibriSpeech, TIMIT, AISHELL-1), periods 2/4/8/16, and five fixed Gaussian seeds. No raw audio or private filesystem paths are distributed. Website results are rounded from this file; these are boundary experiments, not a model leaderboard or a universal detection threshold.

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

Fit each utterance independently before summing energies. For corpus-level comparisons, pool mirror and error energies within each corpus, form its dB score, and average corpus scores with equal weight for a domain macro. This is neither an utterance-level dB mean nor a global energy-pooled score. The illustrative boundary table instead pools all 30 targets (and all five Gaussian seeds when applicable) separately for each condition and period. Those boundary results must not be described as equal-weight corpus macro results.

This supplement defines the **error-normalized variant only**. A target-normalized HA-MAI has a different denominator and interpretation. Existing target-normalized manuscript scores cannot be relabeled as error-normalized scores without verifying or recomputing their underlying energies and aggregation.
