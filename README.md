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
