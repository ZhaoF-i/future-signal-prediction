import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

const em = '<msub><mi>E</mi><mi>m</mi></msub>';
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
  [2, '≈ 0', '−54.30'],
  [4, '≈ 0', '−47.46'],
  [8, '≈ 0', '−38.28'],
  [16, '≈ 0', '−33.64'],
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
          <p>Let <i>x</i>[<i>n</i>] and <InlineMath label="Predicted x" html='<mover><mi>x</mi><mo>^</mo></mover>' />[<i>n</i>] denote a target and its time-aligned prediction, with error <i>e</i>[<i>n</i>] = <i>x</i>[<i>n</i>] − <InlineMath label="Predicted x" html='<mover><mi>x</mi><mo>^</mo></mover>' />[<i>n</i>]. The error-normalized Hop-Adaptive Mirror Artifact Index is</p>
          <Equation id={1} label="HA-MAI error equals ten log base ten of mirror energy plus epsilon divided by total error energy plus epsilon" html={`${metric}<mo>=</mo><mn>10</mn><msub><mi mathvariant="normal">log</mi><mn>10</mn></msub><mfrac><mrow>${em}<mo>+</mo><mi>ε</mi></mrow><mrow>${ee}<mo>+</mo><mi>ε</mi></mrow></mfrac>`} />
          <p>where <i>E</i><sub>m</sub> is the fitted mirror energy, <i>E</i><sub>e</sub> is total prediction-error energy, and ε &gt; 0 stabilizes the ratio. The denominator is error energy, not target energy. Accordingly, this variant measures the periodic share of error rather than artifact magnitude relative to the target.</p>
          <p>Fixed-hop gain errors can be modeled as <i>e</i>[<i>n</i>] ≈ <i>x</i>[<i>n</i>]<i>g</i>[<i>n</i>], where <i>g</i> is a zero-mean sequence of nominal period <i>H</i>. Periodic modulation shifts the target spectrum into harmonic copies. To capture arbitrary modulation phase, use both real Fourier components:</p>
          <Equation id={2} label="Cosine and sine basis functions at nominal period H" html='<mtable rowspacing="0.5em"><mtr><mtd><msub><mi>b</mi><mrow><mi>m</mi><mo>,</mo><mi>c</mi></mrow></msub><mo>[</mo><mi>n</mi><mo>]</mo><mo>=</mo><mi mathvariant="normal">cos</mi><mo>(</mo><mfrac><mrow><mn>2</mn><mi>π</mi><mi>m</mi><mi>n</mi></mrow><mi>H</mi></mfrac><mo>)</mo></mtd></mtr><mtr><mtd><msub><mi>b</mi><mrow><mi>m</mi><mo>,</mo><mi>s</mi></mrow></msub><mo>[</mo><mi>n</mi><mo>]</mo><mo>=</mo><mi mathvariant="normal">sin</mi><mo>(</mo><mfrac><mrow><mn>2</mn><mi>π</mi><mi>m</mi><mi>n</mi></mrow><mi>H</mi></mfrac><mo>)</mo></mtd></mtr></mtable>' />
          <p>Take <i>m</i> = 1, …, ⌊(<i>H</i> − 1)/2⌋ and, for even <i>H</i>, add cos(π<i>n</i>). Excluding DC gives <i>K</i> = <i>H</i> − 1 independent directions. For example, <i>H</i> = 4 requires cos(π<i>n</i>/2), sin(π<i>n</i>/2), and cos(π<i>n</i>); one fixed sine is insufficient. “Adaptive” denotes selection of this basis for <i>H</i>, not automatic period estimation.</p>
          <p>Construct the target-synchronous templates and Gram matrix:</p>
          <Equation id={3} label="Target-modulated templates and their Gram matrix" html='<msub><mi>T</mi><mrow><mi>n</mi><mo>,</mo><mi>j</mi></mrow></msub><mo>=</mo><mi>x</mi><mo>[</mo><mi>n</mi><mo>]</mo><msub><mi>b</mi><mi>j</mi></msub><mo>[</mo><mi>n</mi><mo>]</mo><mo>,</mo><mspace width="1em"/><mi>G</mi><mo>=</mo><msup><mi>T</mi><mi>⊤</mi></msup><mi>T</mi>' />
          <p>Because target weighting generally makes the templates nonorthogonal, fit their coefficients jointly using scaled ridge regularization:</p>
          <Equation id={4} label="Scaled ridge parameter and joint coefficient system" html='<mtable rowspacing="0.5em"><mtr><mtd><mi>α</mi><mo>=</mo><mi>λ</mi><mi mathvariant="normal">max</mi><mo>(</mo><mfrac><mrow><mi mathvariant="normal">tr</mi><mo>(</mo><mi>G</mi><mo>)</mo></mrow><mi>K</mi></mfrac><mo>,</mo><mi>ε</mi><mo>)</mo></mtd></mtr><mtr><mtd><mo>(</mo><mi>G</mi><mo>+</mo><mi>α</mi><mi>I</mi><mo>)</mo><mi>c</mi><mo>=</mo><msup><mi>T</mi><mi>⊤</mi></msup><mi>e</mi></mtd></mtr></mtable>' />
          <p>The fitted component is <InlineMath label="Fitted mirror error" html='<msub><mover><mi>e</mi><mo>^</mo></mover><mtext>mirror</mtext></msub>' /> = <i>Tc</i>. Compute energies as sums of squared samples:</p>
          <Equation id={5} label="Fitted mirror energy and total error energy" html={`${em}<mo>=</mo><msup><mrow><mo>‖</mo><mi>T</mi><mi>c</mi><mo>‖</mo></mrow><mn>2</mn></msup><mo>=</mo><msup><mi>c</mi><mi>⊤</mi></msup><mi>G</mi><mi>c</mi><mo>,</mo><mspace width="1em"/>${ee}<mo>=</mo><msup><mrow><mo>‖</mo><mi>e</mi><mo>‖</mo></mrow><mn>2</mn></msup>`} />
          <p>Use a linear solver with λ = 10<sup>−6</sup> and ε = 10<sup>−12</sup>. Fit each utterance independently. Reversing the error sign changes the fitted waveform’s sign but leaves both energies unchanged.</p>
        </section>

        <section id="interpretation">
          <h2>S2. Interpretation and limitations</h2>
          <p>When stabilization is negligible, −10, −20, and −30 dB indicate mirror shares of approximately 10%, 1%, and 0.1%. Nonnegative ridge ensures 0 ≤ <i>E</i><sub>m</sub> ≤ <i>E</i><sub>e</sub>, giving the fixed-error-energy bounds</p>
          <Equation id={6} label="Exact bounds for fixed error energy" html={`<mn>10</mn><msub><mi mathvariant="normal">log</mi><mn>10</mn></msub><mfrac><mi>ε</mi><mrow>${ee}<mo>+</mo><mi>ε</mi></mrow></mfrac><mo>≤</mo>${metric}<mo>≤</mo><mn>0</mn>`} />
          <p>Exact zero error yields 0 dB through ε/ε and must be labeled <em>no error</em>, rather than interpreted as a high mirror share. Near-zero error is dominated by stabilization; a silent target makes the detector uninformative.</p>
          <p>A lower index does not imply more accurate prediction: unrelated error can lower the ratio by increasing its denominator. Report HA-MAI with NMSE and SDR, or SI-SDR with its convention stated. Mirror-to-target energy provides complementary information about absolute artifact strength. Keep <i>H</i> fixed across compared methods, including randomized-interval counterparts; changing the fitted dimension changes the chance-correlation baseline.</p>
        </section>

        <section id="evidence">
          <h2>S3. Boundary validation</h2>
          <p>Thirty real clean targets were used: ten each from LibriSpeech, TIMIT, and AISHELL-1. The periodic construction <InlineMath label="Predicted x" html='<mover><mi>x</mi><mo>^</mo></mover>' /> = <i>x</i> + 0.2<i>xg</i> uses zero-mean <i>H</i>-periodic <i>g</i> with unit RMS over one period. The second construction replaces the entire prediction with independent, target-RMS-matched Gaussian noise; five fixed seeds give 150 evaluations per period.</p>
          <div className="table-block">
            <p className="paper-table-caption"><strong className="table-label">Table S1.</strong> Energy-pooled HA-MAI<sub>error</sub> (dB). Pure periodic errors are slightly below zero due to ridge shrinkage. Unrounded values are available in the accompanying CSV.</p>
            <Table>
              <TableHeader><TableRow><TableHead scope="col">Period <i>H</i></TableHead><TableHead scope="col">Periodic mirror error</TableHead><TableHead scope="col">Gaussian prediction</TableHead></TableRow></TableHeader>
              <TableBody>{experiment.map(row => <TableRow key={row[0]}>{row.map((v, i) => <TableCell key={i}>{v}</TableCell>)}</TableRow>)}</TableBody>
            </Table>
          </div>
          <p>For each condition and period, Table S1 pools energies across all 30 targets and, where applicable, all five seeds after independent fitting. The periodic error is almost completely recovered. Gaussian predictions score low despite poor waveform fidelity, confirming that the index measures a specific error structure. Their fitted energy reflects finite-sample target/template and noise correlations; these results do not establish a universal noise floor.</p>
        </section>

        <section id="implementation">
          <h2>S4. Reproducibility</h2>
          <p>Use aligned, finite, equal-length waveforms with identical sampling rates and evaluation intervals. Report <i>H</i>, λ, ε, segment length, treatment of silent and near-zero-error samples, and valid-sample counts. To report corpus-level scores, first pool independently fitted energies within each corpus <i>c</i>:</p>
          <Equation id={7} label="Pool mirror and error energies within each corpus" html='<msub><mi>D</mi><mi>c</mi></msub><mo>=</mo><mn>10</mn><msub><mi mathvariant="normal">log</mi><mn>10</mn></msub><mfrac><mrow><munder><mo>∑</mo><mrow><mi>i</mi><mo>∈</mo><mi>c</mi></mrow></munder><msub><mi>E</mi><mrow><mi>m</mi><mo>,</mo><mi>i</mi></mrow></msub><mo>+</mo><mi>ε</mi></mrow><mrow><munder><mo>∑</mo><mrow><mi>i</mi><mo>∈</mo><mi>c</mi></mrow></munder><msub><mi>E</mi><mrow><mi>e</mi><mo>,</mo><mi>i</mi></mrow></msub><mo>+</mo><mi>ε</mi></mrow></mfrac>' />
          <p>An equal-weight domain macro score over <i>C</i> corpora is then</p>
          <Equation id={8} label="Equal-weight mean of corpus scores" html='<msub><mi>D</mi><mtext>macro</mtext></msub><mo>=</mo><mfrac><mn>1</mn><mi>C</mi></mfrac><munderover><mo>∑</mo><mrow><mi>c</mi><mo>=</mo><mn>1</mn></mrow><mi>C</mi></munderover><msub><mi>D</mi><mi>c</mi></msub>' />
          <p>This differs from averaging utterance-level dB values or pooling every corpus together. State the chosen aggregation explicitly; Table S1 uses the all-target pooling described in Section S3.</p>
          <p>The <a href="./hamai.py" download>NumPy implementation</a> uses <code>period=H</code>. The <a href="./data/boundary-summary.csv" download>boundary summary CSV</a> retains the original unrounded measurements. Phase-wise sufficient statistics, fraction-to-dB conversion, input-status handling, and usage examples are documented in the <a href="https://github.com/ZhaoF-i/future-signal-prediction#implementation-details">repository README</a>.</p>
        </section>
        <footer className="paper-footer">Supplementary material · HA-MAI<sub>error</sub></footer>
      </main>
    </>
  );
}
