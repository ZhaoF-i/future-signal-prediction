import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

import equations from '@/math/equations.json';
import dimensions from '@/math/dimensions.generated.json';

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
          <h1>Hop-Adaptive Mirror Artifact Index</h1>
          <p className="subtitle">Error-normalized formulation for future-signal prediction</p>
        </header>
        <p className="abstract">This supplement specifies the error-normalized HA-MAI, its estimation procedure, and boundary validation. Implementation details and numerical checks are provided in the accompanying repository.</p>

        <section id="definition">
          <h2>S1. Definition and estimation</h2>
          <p>A fixed inference hop can make prediction errors repeat across positions within each output block. HA-MAI tests for the part of the error that resembles the target multiplied by a periodic gain pattern. Such modulation creates shifted copies of the target spectrum, which can appear as folded or mirrored structure in a one-sided spectrum.</p>
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
          <p>A mean dB score corresponds to the geometric mean of the stabilized energy ratios. It must not be interpreted as an arithmetic mean of mirror percentages.</p>
          <p>Exact zero error yields 0 dB through ε/ε and must be labeled <em>no error</em>, rather than interpreted as a high mirror share. Near-zero error is dominated by stabilization; a silent target makes the detector uninformative.</p>
          <p>A lower index does not imply more accurate prediction: unrelated error can lower the ratio by increasing its denominator. Report HA-MAI with NMSE and SDR, or SI-SDR with its convention stated. Mirror-to-target energy provides complementary information about absolute artifact strength. Keep <i>H</i> fixed across compared methods, including randomized-interval counterparts; changing the fitted dimension changes the chance-correlation baseline.</p>
        </section>

        <section id="evidence">
          <h2>S3. Boundary validation</h2>
          <p>Thirty real clean targets were used: ten each from LibriSpeech, TIMIT, and AISHELL-1. The periodic construction <InlineMath label="Predicted x" html='<mover><mi>x</mi><mo>^</mo></mover>' /> = <i>x</i> + 0.2<i>xg</i> uses zero-mean <i>H</i>-periodic <i>g</i> with unit RMS over one period. The second construction replaces the entire prediction with independent, target-RMS-matched Gaussian noise; five fixed seeds give 150 evaluations per period.</p>
          <div className="table-block">
            <p className="paper-table-caption"><strong className="table-label">Table S1.</strong> Mean per-unit HA-MAI error (dB). Pure periodic errors are slightly below zero due to ridge shrinkage. Unrounded values are available in the accompanying CSV.</p>
            <Table>
              <TableHeader><TableRow><TableHead scope="col">Period <i>H</i></TableHead><TableHead scope="col">Periodic mirror error</TableHead><TableHead scope="col">Gaussian prediction</TableHead></TableRow></TableHeader>
              <TableBody>{experiment.map(row => <TableRow key={row[0]}>{row.map((v, i) => <TableCell key={i}>{v}</TableCell>)}</TableRow>)}</TableBody>
            </Table>
          </div>
          <p>For each condition and period, Table S1 averages the independently computed per-unit dB scores with equal weights. Each target is one periodic-error record; each target × seed is one Gaussian record (30 and 150 records per period, respectively). All 720 records exceed the energy thresholds in Section S4. The periodic error is almost completely recovered. Gaussian predictions score low despite poor waveform fidelity, confirming that the index measures a specific error structure. Their fitted energy reflects finite-sample target/template and noise correlations; these results do not establish a universal noise floor.</p>
        </section>

        <section id="implementation">
          <h2>S4. Reproducibility</h2>
          <p>Use aligned, finite, equal-length waveforms with identical sampling rates and evaluation intervals. Report <i>H</i>, λ, ε, segment length, treatment of silent and near-zero-error samples, and valid-sample counts. For each valid record <i>i</i>, fit independently and compute <i>d</i><sub>i</sub> using (S1). The corpus score is the arithmetic mean over its <i>N</i><sub>c</sub> valid records:</p>
          <Equation id="7" />
          <p>An equal-weight domain macro score over <i>C</i> corpora is then</p>
          <Equation id="8" />
          <p>Records are not weighted by audio length or error energy. Table S1 uses the per-unit mean over all records for each condition and period; its balanced corpus counts also make it equal to (S8). For unbalanced corpora, these two means can differ.</p>
          <p>Count invalid records, silent targets (target energy ≤ ε), exact zero errors, and near-zero errors (0 &lt; <i>E</i><sub>e</sub> ≤ 100ε) separately and exclude them from the valid-record mean. Silent-target status takes precedence over error-energy status. If no valid records remain, report the score as unavailable; do not substitute 0 dB. A domain macro is unavailable if any included corpus has no valid records.</p>
          <p>The <a href="./hamai.py" download>NumPy implementation</a> uses <code>period=H</code>. Download the <a href="./data/boundary-mean-summary.csv" download>mean summary CSV</a> and <a href="./data/boundary-per-unit.csv" download>anonymized per-unit CSV</a>. The reproducible summary script, phase-wise sufficient statistics, and usage examples are documented in the <a href="https://github.com/ZhaoF-i/future-signal-prediction#implementation-details">repository README</a>.</p>
        </section>
        <footer className="paper-footer">Supplementary material · HA-MAI<sub>error</sub></footer>
      </main>
    </>
  );
}
