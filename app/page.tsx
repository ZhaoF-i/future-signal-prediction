import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const ee = '<msub><mi>E</mi><mi>e</mi></msub>';
const metric = '<msub><mtext>HA-MAI</mtext><mtext>error</mtext></msub>';

function Equation({ id, html, label }: { id: number; html: string; label: string }) {
  return (
    <div className="equation" id={`eq-s${id}`}>
      <div className="math" dangerouslySetInnerHTML={{
        __html: `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block" aria-label="${label}"><mrow>${html}</mrow></math>`,
      }} />
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
          <p><strong>Error-normalized score.</strong> Let <i>x</i>[<i>n</i>] be the target and <InlineMath label="Predicted x" html='<mover><mi>x</mi><mo>^</mo></mover>' />[<i>n</i>] its time-aligned prediction. For a record of <i>N</i> samples, <i>n</i> runs from 0 to <i>N</i> − 1. First form the prediction error; the final score compares fitted mirror energy with total error energy:</p>
          <Equation id={1} label="Prediction error and error-normalized HA-MAI score" html='<mtable displaystyle="true" columnalign="right left" columnspacing="0.4em" rowspacing="0.8em"><mtr><mtd><mi>e</mi><mo>[</mo><mi>n</mi><mo>]</mo></mtd><mtd><mo>=</mo><mi>x</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>−</mo><mover><mi>x</mi><mo>^</mo></mover><mo>[</mo><mi>n</mi><mo>]</mo></mtd></mtr><mtr><mtd><msub><mtext>HA-MAI</mtext><mtext>error</mtext></msub></mtd><mtd><mo>=</mo><mn>10</mn><msub><mi mathvariant="normal">log</mi><mn>10</mn></msub><mo>⁡</mo><mrow><mo>(</mo><mfrac><mrow><msub><mi>E</mi><mi>m</mi></msub><mo>+</mo><mi>ε</mi></mrow><mrow><msub><mi>E</mi><mi>e</mi></msub><mo>+</mo><mi>ε</mi></mrow></mfrac><mo>)</mo></mrow></mtd></mtr></mtable>' />
          <p>Here <i>E</i><sub>m</sub> is the energy of the fitted mirror component, <i>E</i><sub>e</sub> is total prediction-error energy, and ε &gt; 0 stabilizes the ratio. Thus (S1) asks how large the fitted mirror component is relative to the total error. The factor 10 converts an energy ratio to decibels. Equations (S2)–(S5) specify how to estimate its numerator.</p>
          <p><strong>Periodic modulation basis.</strong> Model the mirror component as <i>x</i>[<i>n</i>]<i>g</i>[<i>n</i>], where <i>g</i> has nominal period <i>H</i> samples and zero mean over one period. Expand <i>g</i> in real Fourier basis functions, with <i>m</i> indexing the harmonics:</p>
          <Equation id={2} label="Cosine and sine modulation basis functions" html='<mtable displaystyle="true" columnalign="right left" columnspacing="0.4em" rowspacing="0.8em"><mtr><mtd><msub><mi>b</mi><mrow><mi>m</mi><mo>,</mo><mtext>cos</mtext></mrow></msub><mo>[</mo><mi>n</mi><mo>]</mo></mtd><mtd><mo>=</mo><mi mathvariant="normal">cos</mi><mo>⁡</mo><mrow><mo>(</mo><mfrac><mrow><mn>2</mn><mi>π</mi><mi>m</mi><mi>n</mi></mrow><mrow><mi>H</mi></mrow></mfrac><mo>)</mo></mrow></mtd></mtr><mtr><mtd><msub><mi>b</mi><mrow><mi>m</mi><mo>,</mo><mtext>sin</mtext></mrow></msub><mo>[</mo><mi>n</mi><mo>]</mo></mtd><mtd><mo>=</mo><mi mathvariant="normal">sin</mi><mo>⁡</mo><mrow><mo>(</mo><mfrac><mrow><mn>2</mn><mi>π</mi><mi>m</mi><mi>n</mi></mrow><mrow><mi>H</mi></mrow></mfrac><mo>)</mo></mrow></mtd></mtr></mtable>' />
          <p>Use both sine and cosine for <i>m</i> = 1, …, ⌊(<i>H</i> − 1)/2⌋ so the fit can capture any modulation phase. For even <i>H</i>, also include cos(π<i>n</i>); its sine counterpart vanishes at integer samples. Exclude the constant (DC) basis: multiplying it by the target would model a uniform gain mismatch, rather than variation across hop positions.</p>
          <p>This gives <i>K</i> = <i>H</i> − 1 basis functions spanning all zero-mean <i>H</i>-periodic patterns. For <i>H</i> = 2, the sole basis is cos(π<i>n</i>); for <i>H</i> = 4, use cos(π<i>n</i>/2), sin(π<i>n</i>/2), and cos(π<i>n</i>). “Adaptive” means choosing the complete basis for the specified <i>H</i>; the detector does not estimate <i>H</i> automatically.</p>
          <p><strong>Target-synchronous templates.</strong> A sine or cosine alone describes a pure tone. To detect periodic copies of the current target’s spectral structure, multiply each basis function by that target:</p>
          <Equation id={3} label="Multiply the target by each basis, then assemble the template columns" html='<mtable displaystyle="true" columnalign="right left" columnspacing="0.4em" rowspacing="0.8em"><mtr><mtd><msub><mi>t</mi><mi>j</mi></msub><mo>[</mo><mi>n</mi><mo>]</mo></mtd><mtd><mo>=</mo><mi>x</mi><mo>[</mo><mi>n</mi><mo>]</mo><msub><mi>b</mi><mi>j</mi></msub><mo>[</mo><mi>n</mi><mo>]</mo></mtd></mtr><mtr><mtd><mi>T</mi></mtd><mtd><mo>=</mo><mo>[</mo><msub><mi>t</mi><mn>1</mn></msub><mspace width="0.5em"/><mo>⋯</mo><mspace width="0.5em"/><msub><mi>t</mi><mi>K</mi></msub><mo>]</mo></mtd></mtr></mtable>' />
          <p>Each <i>t</i><sub>j</sub> is one complete template waveform. Stack the <i>K</i> waveforms as columns of <i>T</i>, an <i>N</i> × <i>K</i> matrix. The fit assigns a weight <i>c</i><sub>j</sub> to each column. Together, these weighted templates describe a periodic modulation of the target.</p>
          <p><strong>Joint ridge fit.</strong> Choose the template weights to match the observed error by least squares, with a small ridge penalty on the coefficients. Multiplication by the target generally makes the templates nonorthogonal, so their weights must be fitted together. Compute the following quantities in order:</p>
          <Equation id={4} label="Compute the Gram matrix, error correlations, ridge strength, then solve for coefficients" html='<mtable displaystyle="true" columnalign="right left" columnspacing="0.4em" rowspacing="0.8em"><mtr><mtd><mi>G</mi></mtd><mtd><mo>=</mo><msup><mi>T</mi><mo>⊤</mo></msup><mi>T</mi></mtd></mtr><mtr><mtd><mi>h</mi></mtd><mtd><mo>=</mo><msup><mi>T</mi><mo>⊤</mo></msup><mi>e</mi></mtd></mtr><mtr><mtd><mi>α</mi></mtd><mtd><mo>=</mo><mi>λ</mi><mi mathvariant="normal">max</mi><mo>⁡</mo><mrow><mo>(</mo><mfrac><mrow><mi mathvariant="normal">tr</mi><mo>⁡</mo><mrow><mo>(</mo><mi>G</mi><mo>)</mo></mrow></mrow><mrow><mi>K</mi></mrow></mfrac><mo>,</mo><mi>ε</mi><mo>)</mo></mrow></mtd></mtr><mtr><mtd><mi>c</mi></mtd><mtd><mo>=</mo><mi mathvariant="normal">solve</mi><mo>⁡</mo><mrow><mo>(</mo><mi>G</mi><mo>+</mo><mi>α</mi><mi>I</mi><mo>,</mo><mi>h</mi><mo>)</mo></mrow></mtd></mtr></mtable>' />
          <p><i>G</i> records correlations between templates, and <i>h</i> records their correlations with the error; ⊤ denotes transpose. The average template energy tr(<i>G</i>)/<i>K</i> sets the scale of the ridge strength <i>α</i>. Here tr sums the diagonal entries, <i>I</i> is the <i>K</i> × <i>K</i> identity matrix, λ = 10<sup>−6</sup>, and ε = 10<sup>−12</sup>.</p>
          <p>The notation solve(<i>A</i>, <i>b</i>) means finding <i>z</i> such that <i>Az</i> = <i>b</i>, without explicitly computing a matrix inverse. The added ridge term stabilizes the fit when templates are nearly dependent.</p>
          <p><strong>Reconstruction and energy.</strong> Multiply each template by its fitted weight and add the results to reconstruct the mirror waveform. Then square and sum the samples of that waveform and of the original error:</p>
          <Equation id={5} label="Reconstruct the mirror waveform, then sum its squared samples and the squared errors" html='<mtable displaystyle="true" columnalign="right left" columnspacing="0.4em" rowspacing="0.8em"><mtr><mtd><msub><mover><mi>e</mi><mo>^</mo></mover><mtext>mirror</mtext></msub><mo>[</mo><mi>n</mi><mo>]</mo></mtd><mtd><mo>=</mo><munderover><mo>∑</mo><mrow><mi>j</mi><mo>=</mo><mn>1</mn></mrow><mrow><mi>K</mi></mrow></munderover><msub><mi>c</mi><mi>j</mi></msub><msub><mi>t</mi><mi>j</mi></msub><mo>[</mo><mi>n</mi><mo>]</mo></mtd></mtr><mtr><mtd><msub><mi>E</mi><mi>m</mi></msub></mtd><mtd><mo>=</mo><munderover><mo>∑</mo><mrow><mi>n</mi><mo>=</mo><mn>0</mn></mrow><mrow><mi>N</mi><mo>−</mo><mn>1</mn></mrow></munderover><msup><mrow><msub><mover><mi>e</mi><mo>^</mo></mover><mtext>mirror</mtext></msub><mo>[</mo><mi>n</mi><mo>]</mo></mrow><mn>2</mn></msup></mtd></mtr><mtr><mtd><msub><mi>E</mi><mi>e</mi></msub></mtd><mtd><mo>=</mo><munderover><mo>∑</mo><mrow><mi>n</mi><mo>=</mo><mn>0</mn></mrow><mrow><mi>N</mi><mo>−</mo><mn>1</mn></mrow></munderover><msup><mrow><mi>e</mi><mo>[</mo><mi>n</mi><mo>]</mo></mrow><mn>2</mn></msup></mtd></mtr></mtable>' />
          <p>Use the energy of the reconstructed waveform itself as <i>E</i><sub>m</sub>. The fitting objective and the reduction in residual error are different quantities when ridge is used. Substitute <i>E</i><sub>m</sub> and <i>E</i><sub>e</sub> into (S1) to obtain the record’s score. Fit each record independently; reversing the error sign reverses the fitted waveform but leaves the energies and score unchanged.</p>
        </section>

        <section id="interpretation">
          <h2>S2. Interpretation and limitations</h2>
          <p>For an individual record, when stabilization is negligible, −10, −20, and −30 dB indicate mirror shares of approximately 10%, 1%, and 0.1%. Nonnegative ridge ensures 0 ≤ <i>E</i><sub>m</sub> ≤ <i>E</i><sub>e</sub>, giving the fixed-error-energy bounds</p>
          <Equation id={6} label="Exact bounds for fixed error energy" html={`<mn>10</mn><msub><mi mathvariant="normal">log</mi><mn>10</mn></msub><mfrac><mi>ε</mi><mrow>${ee}<mo>+</mo><mi>ε</mi></mrow></mfrac><mo>≤</mo>${metric}<mo>≤</mo><mn>0</mn>`} />
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
          <Equation id={7} label="Corpus score equals the arithmetic mean of valid per-record dB scores" html='<msub><mi>D</mi><mi>c</mi></msub><mo>=</mo><mfrac><mn>1</mn><msub><mi>N</mi><mi>c</mi></msub></mfrac><munder><mo>∑</mo><mrow><mi>i</mi><mo>∈</mo><mi>c</mi></mrow></munder><msub><mi>d</mi><mi>i</mi></msub>' />
          <p>An equal-weight domain macro score over <i>C</i> corpora is then</p>
          <Equation id={8} label="Equal-weight mean of corpus scores" html='<msub><mi>D</mi><mtext>macro</mtext></msub><mo>=</mo><mfrac><mn>1</mn><mi>C</mi></mfrac><munderover><mo>∑</mo><mrow><mi>c</mi><mo>=</mo><mn>1</mn></mrow><mi>C</mi></munderover><msub><mi>D</mi><mi>c</mi></msub>' />
          <p>Records are not weighted by audio length or error energy. Table S1 uses the per-unit mean over all records for each condition and period; its balanced corpus counts also make it equal to (S8). For unbalanced corpora, these two means can differ.</p>
          <p>Count invalid records, silent targets (target energy ≤ ε), exact zero errors, and near-zero errors (0 &lt; <i>E</i><sub>e</sub> ≤ 100ε) separately and exclude them from the valid-record mean. Silent-target status takes precedence over error-energy status. If no valid records remain, report the score as unavailable; do not substitute 0 dB. A domain macro is unavailable if any included corpus has no valid records.</p>
          <p>The <a href="./hamai.py" download>NumPy implementation</a> uses <code>period=H</code>. Download the <a href="./data/boundary-mean-summary.csv" download>mean summary CSV</a> and <a href="./data/boundary-per-unit.csv" download>anonymized per-unit CSV</a>. The reproducible summary script, phase-wise sufficient statistics, and usage examples are documented in the <a href="https://github.com/ZhaoF-i/future-signal-prediction#implementation-details">repository README</a>.</p>
        </section>
        <footer className="paper-footer">Supplementary material · HA-MAI<sub>error</sub></footer>
      </main>
    </>
  );
}
