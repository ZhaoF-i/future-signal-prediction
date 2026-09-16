import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

import equations from '@/math/equations.json';
import dimensions from '@/math/dimensions.generated.json';
import exampleData from '@/public/examples/metadata.json';

function formatDb(value: number) {
  return `${value.toFixed(2).replace('-', '−')} dB`;
}

function MirrorExamples() {
  return <>
    <h3>Real model examples (<i>H</i> = 4)</h3>
    <p>Figures S1–S6 provide one selected example from each of the six test corpora. Standalone S4-TD is trained independently; it is not the internal base output of the complete system. The complete system combines S4-TD, PE-PostNet, MS-PostNet, and Adjacent RandomInterval. These qualitative examples are not corpus averages.</p>
    <p>For these configurations, standalone S4-TD uses B = F = H = 4. The complete system uses B = F = 5 and commitment intervals H<sub>k</sub> ∈ {'{4, 5}'}, with short-interval prior q = 0.9. The detector uses H = 4 for both. We trim one initial sample from the standalone target and predicted signal, then compare identical targets over a common interval. This compares the combined systems, not a matched-F ablation of MS-PostNet.</p>
    <nav className="example-index" aria-label="Examples by test corpus">{exampleData.examples.map((example, index) => <a key={example.id} href={`#figure-s${index + 1}`}>{example.dataset}</a>)}</nav>
    {exampleData.examples.map((example, index) => (
      <figure className="mirror-example" id={`figure-s${index + 1}`} key={example.id}>
        <h3>{example.domain} · {example.dataset}</h3>
        <p className="panel-label">(a) Target and predicted signals</p>
        <a className="spectrogram-link" href={`./examples/${example.figure.file}`} aria-label={`Open full-resolution ${example.domain.toLowerCase()} spectrogram`}>
          <img className="spectrogram" src={`./examples/${example.figure.file}`}
            width={example.figure.width} height={example.figure.height} loading="lazy"
            alt={`${example.domain} example ${example.sample_id}: aligned Target, Standalone S4-TD, and Complete system spectrograms, with one shared −80 to 0 dB color scale.`} />
        </a>
        <div className="audio-comparison">
          {example.tracks.map(track => (
            <div className="audio-track" key={track.role}>
              <p className="track-label" id={`${example.id}-${track.role}-label`}>{track.label}</p>
              <p className="track-context">{track.role === 'target' ? 'Reference' : track.role === 'baseline' ? 'B = F = 4' : 'B = F = 5; Hₖ ∈ {4, 5}'}</p>
              <audio controls preload="none" aria-labelledby={`${example.id}-${track.role}-label`}>
                <source src={`./examples/${track.file}`} type="audio/wav" />
                <a href={`./examples/${track.file}`}>Download WAV</a>
              </audio>
              {track.metrics && <p className="track-metrics">HA-MAI: <span>{formatDb(track.metrics.hamai_error_db)}</span><br />NMSE: <span>{formatDb(track.metrics.nmse_db)}</span></p>}
            </div>
          ))}
        </div>
        <p className="panel-label">(b) Prediction errors: target − predicted signal</p>
        <a className="spectrogram-link" href={`./examples/${example.errors.figure.file}`} aria-label={`Open full-resolution ${example.domain.toLowerCase()} error spectrogram`}>
          <img className="spectrogram" src={`./examples/${example.errors.figure.file}`}
            width={example.errors.figure.width} height={example.errors.figure.height} loading="lazy"
            alt={`${example.domain} prediction errors: Standalone S4-TD error and Complete-system error, using the same time interval and magnitude reference as panel (a).`} />
        </a>
        <div className="audio-comparison error-comparison">
          {example.errors.tracks.map(track => (
            <div className="audio-track" key={track.role}>
              <p className="track-label" id={`${example.id}-${track.role}-error-label`}>{track.label}</p>
              <p className="track-context">Target − {track.role === 'baseline' ? 'standalone predicted signal' : 'complete-system predicted signal'}</p>
              <audio controls preload="none" aria-labelledby={`${example.id}-${track.role}-error-label`}>
                <source src={`./examples/${track.file}`} type="audio/wav" />
                <a href={`./examples/${track.file}`}>Download error WAV</a>
              </audio>
            </div>
          ))}
        </div>
        <figcaption className="paper-figure-caption">
          <strong className="figure-label">Figure S{index + 1}.</strong>{' '}
          Mirror suppression on {example.dataset} <span className="sample-id">{example.sample_id}</span>.{' '}
          A {example.duration_seconds.toFixed(2)} s excerpt starting at sample {example.alignment.crop_start_sample} of the aligned interval. (a) Target and predicted signals. (b) Total prediction errors, target − predicted signal, including both mirror and other error components. HA-MAI and NMSE are computed on the published excerpt; lower values mean a smaller fitted error share and lower relative error energy, respectively.
          <span className="example-credit">Source: <a href={example.dataset_credit.source_url}>{example.dataset}</a> · <a href={example.dataset_credit.license_url}>{example.dataset_credit.license}</a>. Attribution and excerpt processing: <a href="./examples/ATTRIBUTION.md">media credits</a>.</span>
        </figcaption>
      </figure>
    ))}
    <p className="example-methods">All audio is mono, 16 kHz PCM16. Each target/predicted-signal group uses one shared gain (peak ≤ 0.95); error tracks are their exact differences, without further normalization or clipping. Spectrograms use a 512-sample Hann window, 128-sample frame shift, and 1024-point FFT over 0–8 kHz. Within each example, target, predicted signals, and errors share one magnitude reference and an 80 dB color range. Dashed lines mark the 2, 4, and 6 kHz mirror-symmetry axes. Click a figure to view it at full resolution. NMSE is 10 log₁₀ of error energy divided by target energy. <a href="./examples/metadata.json" download>Download clip metrics and metadata</a>.</p>
  </>;
}

function Equation({ id }: { id: keyof typeof equations }) {
  const { label } = equations[id];
  const { widthEm, heightEm } = dimensions[id];
  return (
    <div className="equation" id={`eq-s${id}`}>
      <div className="math">
        <img
          className="equation-image"
          src={`./equations/s${id}.svg`}
          alt={label}
          width={Math.round(widthEm * 16)}
          height={Math.round(heightEm * 16)}
          style={{ width: `${widthEm}em` }}
        />
      </div>
      <span className="equation-number">(S{id})</span>
    </div>
  );
}

function InlineMath({ html, label }: { html: string; label: string }) {
  return <span className="inline-math" dangerouslySetInnerHTML={{
    __html: `<math xmlns="http://www.w3.org/1998/Math/MathML" aria-label="${label}"><mrow>${html}</mrow></math>`,
  }} />;
}

const experiment = [
  [2, '≈ 0', '−56.81'],
  [4, '≈ 0', '−46.60'],
  [8, '≈ 0', '−37.92'],
  [16, '≈ 0', '−32.74'],
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#definition">Skip to main text</a>
      <main className="paper" id="content">
        <header className="paper-header">
          <p className="document-type">Supplementary Material</p>
          <h1>Sample-Level Speech and Noise Prediction</h1>
          <p className="subtitle">Unified evaluation and hop-periodic artifact mitigation</p>
        </header>
        <p className="abstract">This supplement accompanies the paper “Sample-Level Speech and Noise Prediction: Unified Evaluation and Hop-Periodic Artifact Mitigation.” It explains HA-MAI and provides target, prediction, and error examples from the six test corpora. Speech and noise predictors are trained separately under a common causal protocol; prediction length F is specified in samples.</p>

        <section id="definition">
          <h2>S1. Definition and estimation</h2>
          <p>Fixed-hop blockwise prediction repeatedly associates each output position with the same sampling-grid phase. The paper models the error as <i>e</i>[<i>n</i>] ≈ <i>a</i><sub>r</sub><i>x</i>[<i>n</i>] + <i>b</i><sub>r</sub> + η[<i>n</i>], where <i>r</i> = <i>n</i> mod <i>H</i>, <i>a</i><sub>r</sub> and <i>b</i><sub>r</sub> are periodic gain and bias errors, and η is non-periodic error. The Hop-Adaptive Mirror Artifact Index (HA-MAI) measures the gain-related component captured by target-modulated periodic templates.</p>
          <p>Periodic gain modulation shifts copies of the target spectrum by multiples of <i>F</i><sub>s</sub>/<i>H</i>. Its first harmonic can produce reflections about <i>F</i><sub>s</sub>/(2<i>H</i>), giving 4, 2, 1, and 0.5 kHz at 16 kHz for <i>H</i> = 2, 4, 8, and 16. For the H = 4 examples below, mirror patterns may appear about 2, 4, and 6 kHz. These target-synchronous artifacts differ from ordinary DFT conjugate symmetry and unrelated high-frequency errors. Modulation of a nonzero DC component can also produce the whistle-like tonal artifacts described in the paper.</p>
          <p><strong>Error-normalized score.</strong> Let <i>x</i>[<i>n</i>] be the target and <InlineMath label="Predicted x" html='<mover><mi>x</mi><mo>^</mo></mover>' />[<i>n</i>] its time-aligned prediction. For a record of <i>N</i> samples, <i>n</i> runs from 0 to <i>N</i> − 1. Define <i>e</i>[<i>n</i>] = <i>x</i>[<i>n</i>] − <InlineMath label="Predicted x" html='<mover><mi>x</mi><mo>^</mo></mover>' />[<i>n</i>]. The score compares fitted mirror energy with total error energy:</p>
          <Equation id="1" />
          <p>Here <i>E</i><sub>mirror</sub> is the energy of the fitted mirror component, <i>E</i><sub>error</sub> is total prediction-error energy, and ε &gt; 0 stabilizes the ratio. These energies are abbreviated as <i>E</i><sub>m</sub> and <i>E</i><sub>e</sub> below. Thus (S1) asks how large the fitted mirror component is relative to the total error. The factor 10 converts an energy ratio to decibels. Equations (S2)–(S5) specify how to estimate its numerator.</p>
          <p><strong>Periodic modulation basis.</strong> Model the mirror component as <i>x</i>[<i>n</i>]<i>g</i>[<i>n</i>], where <i>g</i> has nominal period <i>H</i> samples and zero mean over one period. Expand <i>g</i> in real Fourier basis functions, with <i>m</i> indexing the harmonics:</p>
          <Equation id="2" />
          <p>Use both sine and cosine for <i>m</i> = 1, …, ⌊(<i>H</i> − 1)/2⌋ so the fit can capture any modulation phase. For even <i>H</i>, also include cos(π<i>n</i>); its sine counterpart vanishes at integer samples. Exclude the constant (DC) basis: multiplying it by the target would model a uniform gain mismatch, rather than variation across hop positions.</p>
          <p>This gives <i>K</i> = <i>H</i> − 1 basis functions spanning all zero-mean <i>H</i>-periodic patterns. For <i>H</i> = 2, the sole basis is cos(π<i>n</i>); for <i>H</i> = 4, use cos(π<i>n</i>/2), sin(π<i>n</i>/2), and cos(π<i>n</i>). “Adaptive” means choosing the complete basis for the specified <i>H</i>; the detector does not estimate <i>H</i> automatically.</p>
          <p><strong>Target-synchronous templates.</strong> A sine or cosine alone describes a pure tone. To detect periodic copies of the current target’s spectral structure, multiply each basis function by that target:</p>
          <Equation id="3" />
          <p>Each template is the target multiplied by one cosine or sine basis. Stack all <i>K</i> templates as columns of <i>T</i>, an <i>N</i> × <i>K</i> real matrix. The coefficient vector <i>c</i> gives one fitted weight per template.</p>
          <p><strong>Joint ridge fit.</strong> Choose the template weights to match the observed error by least squares, with a small ridge penalty on the coefficients. Multiplication by the target generally makes the templates nonorthogonal, so their weights must be fitted together. Compute the following quantities in order:</p>
          <Equation id="4" />
          <p><i>G</i> contains the template inner products; rhs contains the template–error inner products. The trace is the sum of the diagonal entries, so scale is the average template energy. The superscript ⊤ denotes transpose, and <i>I</i> is the <i>K</i> × <i>K</i> identity matrix. Use λ = 10<sup>−6</sup> and ε = 10<sup>−12</sup>; α is the resulting energy-scaled ridge strength.</p>
          <p>The notation solve(<i>A</i>, <i>b</i>) means finding <i>z</i> such that <i>Az</i> = <i>b</i>, without explicitly computing a matrix inverse. The added ridge term stabilizes the fit when templates are nearly dependent.</p>
          <p><strong>Reconstruction and energy.</strong> Reconstruct the mirror waveform, denoted <InlineMath label="Fitted mirror error" html='<msub><mover><mi>e</mi><mo>^</mo></mover><mtext>mirror</mtext></msub>' />, by multiplying the template matrix by its fitted coefficient vector. Compute mirror and error energies using squared L2 norms:</p>
          <Equation id="5" />
          <p>Here <InlineMath label="L2 norm" html='<msub><mrow><mo>‖</mo><mo>·</mo><mo>‖</mo></mrow><mn>2</mn></msub>' /> denotes the L2 (Euclidean) norm. Use the energy of the reconstructed waveform itself as <i>E</i><sub>m</sub>. The fitting objective and the reduction in residual error are different quantities when ridge is used. Substitute <i>E</i><sub>m</sub> and <i>E</i><sub>e</sub> into (S1) to obtain the record’s score. Fit each record independently; reversing the error sign reverses the fitted waveform but leaves the energies and score unchanged.</p>
        </section>

        <section id="interpretation">
          <h2>S2. Interpretation and limitations</h2>
          <p>For an individual record, when stabilization is negligible, −10, −20, and −30 dB indicate mirror shares of approximately 10%, 1%, and 0.1%. Nonnegative ridge ensures 0 ≤ <i>E</i><sub>m</sub> ≤ <i>E</i><sub>e</sub>, giving the fixed-error-energy bounds</p>
          <Equation id="6" />
          <p>The paper computes HA-MAI for each evaluation unit, averages its dB values within each corpus, then weights the three corpora in each domain equally. A mean dB score corresponds to the geometric mean of the stabilized energy ratios, not an arithmetic mean of mirror percentages. The score in this supplement is the paper’s error-normalized HA-MAI.</p>
          <p>Exact zero error yields 0 dB through ε/ε and must be labeled <em>no error</em>, rather than interpreted as a high mirror share. Near-zero error is dominated by stabilization; a silent target makes the detector uninformative.</p>
          <p>A lower index does not imply more accurate prediction: unrelated error can lower the ratio by increasing its denominator. The paper reports HA-MAI together with NMSE and SDR: lower NMSE and higher SDR indicate better waveform prediction. Keep <i>H</i> fixed across compared methods, including randomized-interval counterparts; changing the fitted dimension changes the chance-correlation baseline.</p>
          <p>In the paper, PE-PostNet improves waveform accuracy, while the complete system adds MS-PostNet and Adjacent RandomInterval across all three stages. Lower HA-MAI describes a reduced fitted share of total error; it alone does not prove a reduction in absolute mirror energy or isolate periodic bias errors. The complete system uses the shorter commitment interval as the detector period, matching its fixed-hop counterpart.</p>
        </section>

        <section id="evidence">
          <h2>S3. Boundary validation and model examples</h2>
          <p>Thirty real clean targets were used: ten each from LibriSpeech, TIMIT, and AISHELL-1. The periodic construction <InlineMath label="Predicted x" html='<mover><mi>x</mi><mo>^</mo></mover>' /> = <i>x</i> + 0.2<i>xg</i> uses zero-mean <i>H</i>-periodic <i>g</i> with unit RMS over one period. The second construction replaces the entire prediction with independent, target-RMS-matched Gaussian noise; five fixed seeds give 150 evaluations per period.</p>
          <div className="table-block">
            <p className="paper-table-caption"><strong className="table-label">Table S1.</strong> Mean per-unit HA-MAI (dB). Pure periodic errors are slightly below zero due to ridge shrinkage. Unrounded values are available in the <a href="./data/boundary-mean-summary.csv">summary CSV</a>.</p>
            <Table>
              <TableHeader><TableRow><TableHead scope="col">Period <i>H</i></TableHead><TableHead scope="col">Periodic mirror error</TableHead><TableHead scope="col">Gaussian prediction</TableHead></TableRow></TableHeader>
              <TableBody>{experiment.map(row => <TableRow key={row[0]}>{row.map((v, i) => <TableCell key={i}>{v}</TableCell>)}</TableRow>)}</TableBody>
            </Table>
          </div>
          <p>For each condition and period, Table S1 averages the independently computed per-unit dB scores with equal weights. Each target is one periodic-error record; each target × seed is one Gaussian record (30 and 150 records per period, respectively). All 720 records have non-silent targets and error energy above 100ε. The periodic error is almost completely recovered. Gaussian predictions score low despite poor waveform fidelity, confirming that the index measures a specific error structure. Their fitted energy reflects finite-sample target/template and noise correlations; these results do not establish a universal noise floor.</p>
          <MirrorExamples />
        </section>

        <footer className="paper-footer">Supplementary material · HA-MAI · <a href="https://github.com/ZhaoF-i/future-signal-prediction">Code, data, and implementation details</a></footer>
      </main>
    </>
  );
}
