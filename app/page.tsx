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

const experiment = [
  [2, 1, '99.999800', '−0.000009', '0.000372', '−54.30'],
  [4, 3, '99.999753', '−0.000011', '0.001793', '−47.46'],
  [8, 7, '99.999778', '−0.000010', '0.014848', '−38.28'],
  [16, 15, '99.999789', '−0.000009', '0.043243', '−33.64'],
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

        <p className="abstract"><strong>Overview.</strong> This supplement defines the error-normalized Hop-Adaptive Mirror Artifact Index (HA-MAI), describes its computation using target-synchronous periodic templates, and discusses its interpretation and limitations. Boundary experiments and a reference implementation are provided for reproducibility.</p>

        <section id="definition">
          <h2>S1. Metric definition</h2>
          <p>Let <i>y</i>[<i>n</i>] and ŷ[<i>n</i>] denote a target waveform and its time-aligned prediction, respectively. The prediction error is <i>e</i>[<i>n</i>] = ŷ[<i>n</i>] − <i>y</i>[<i>n</i>]. The error-normalized HA-MAI is defined as</p>
          <Equation id={1} label="HA-MAI error equals ten log base ten of mirror energy plus epsilon divided by total error energy plus epsilon" html={`${metric}<mo>=</mo><mn>10</mn><msub><mi mathvariant="normal">log</mi><mn>10</mn></msub><mfrac><mrow>${em}<mo>+</mo><mi>ε</mi></mrow><mrow>${ee}<mo>+</mo><mi>ε</mi></mrow></mfrac>`} />
          <p>where <i>E</i><sub>m</sub> is the energy of the fitted mirror component, <i>E</i><sub>e</sub> = ‖<i>e</i>‖² is the total prediction-error energy, and ε &gt; 0 is a numerical stabilizer. The denominator in Eq. <a href="#eq-s1">(S1)</a> is <em>error energy</em>, rather than target energy. The result is reported in decibels (dB).</p>
          <p>The fitted component is obtained from non-DC periodic modulations of the target, as detailed below. Consequently, the index measures the relative energy captured by a specified target-synchronous periodic model. It does not measure overall prediction accuracy or all forms of spectral distortion.</p>
        </section>

        <section id="model">
          <h2>S2. Periodic error model and estimation</h2>
          <h3>S2.1. Periodic modulation model</h3>
          <p>In blockwise prediction, position-dependent gain errors can repeat on a fixed output grid. A corresponding error model is</p>
          <Equation id={2} label="Prediction error is approximately target times a zero-mean periodic modulation of period P" html='<mi>e</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>≈</mo><mi>y</mi><mo>[</mo><mi>n</mi><mo>]</mo><mi>g</mi><mo>[</mo><mi>n</mi><mo>]</mo><mo>,</mo><mspace width="1em"/><mi>g</mi><mo>[</mo><mi>n</mi><mo>+</mo><mi>P</mi><mo>]</mo><mo>=</mo><mi>g</mi><mo>[</mo><mi>n</mi><mo>]</mo>' />
          <p>Here, <i>P</i> is the period under investigation and <i>g</i> has zero mean over one period. Multiplication by a periodic sequence shifts the target spectrum to harmonic offsets. The resulting copies and folding can appear as mirror artifacts in a one-sided spectrum. The constant modulation component is excluded because it represents a common gain error across all grid positions.</p>
          <p>The term “hop-adaptive” refers to selecting the detection basis for <i>P</i>; it does not imply automatic period estimation. For a fixed-hop predictor, <i>P</i> is normally the hop size. When testing whether a randomized-interval method suppresses a parent hop-4 artifact, the detection period remains <i>P</i> = 4.</p>

          <h3>S2.2. Complete non-DC basis</h3>
          <p>For harmonics <i>m</i> = 1, …, ⌊(<i>P</i> − 1)/2⌋, the real Fourier basis contains the pairs</p>
          <Equation id={3} label="Cosine and sine periodic basis functions" html='<mtable rowspacing="0.65em"><mtr><mtd><msub><mi>b</mi><mrow><mi>m</mi><mo>,</mo><mi>c</mi></mrow></msub><mo>[</mo><mi>n</mi><mo>]</mo><mo>=</mo><mi mathvariant="normal">cos</mi><mo>(</mo><mfrac><mrow><mn>2</mn><mi>π</mi><mi>m</mi><mi>n</mi></mrow><mi>P</mi></mfrac><mo>)</mo></mtd></mtr><mtr><mtd><msub><mi>b</mi><mrow><mi>m</mi><mo>,</mo><mi>s</mi></mrow></msub><mo>[</mo><mi>n</mi><mo>]</mo><mo>=</mo><mi mathvariant="normal">sin</mi><mo>(</mo><mfrac><mrow><mn>2</mn><mi>π</mi><mi>m</mi><mi>n</mi></mrow><mi>P</mi></mfrac><mo>)</mo></mtd></mtr></mtable>' />
          <p>For even <i>P</i>, the Nyquist cosine cos(π<i>n</i>) is also included; the corresponding sine is identically zero at integer samples. The resulting <i>K</i> = <i>P</i> − 1 basis functions span the complete space of zero-mean <i>P</i>-periodic sequences.</p>
          <div className="table-block">
            <p className="paper-table-caption"><strong className="table-label">Table S1.</strong> Complete non-DC basis for <i>P</i> = 4. The four phase values repeat periodically.</p>
            <Table>
              <TableHeader><TableRow><TableHead scope="col">Basis function</TableHead><TableHead scope="col">Phase 0</TableHead><TableHead scope="col">Phase 1</TableHead><TableHead scope="col">Phase 2</TableHead><TableHead scope="col">Phase 3</TableHead></TableRow></TableHeader>
              <TableBody>
                <TableRow><TableCell>cos(π<i>n</i>/2)</TableCell><TableCell>1</TableCell><TableCell>0</TableCell><TableCell>−1</TableCell><TableCell>0</TableCell></TableRow>
                <TableRow><TableCell>sin(π<i>n</i>/2)</TableCell><TableCell>0</TableCell><TableCell>1</TableCell><TableCell>0</TableCell><TableCell>−1</TableCell></TableRow>
                <TableRow><TableCell>cos(π<i>n</i>)</TableCell><TableCell>1</TableCell><TableCell>−1</TableCell><TableCell>1</TableCell><TableCell>−1</TableCell></TableRow>
              </TableBody>
            </Table>
          </div>
          <p>For <i>P</i> = 2, cos(π<i>n</i>) = (−1)<sup><i>n</i></sup> is the only non-DC direction. For larger periods, a single fixed sine may miss phase-shifted components or higher harmonics. Table S1 illustrates the three independent directions required for period 4.</p>

          <h3>S2.3. Target-synchronous templates and ridge fitting</h3>
          <p>For an evaluation segment containing <i>N</i> samples, the template matrix <i>T</i> ∈ ℝ<sup><i>N</i>×<i>K</i></sup> is constructed as</p>
          <Equation id={4} label="Each template is the target waveform multiplied by a periodic basis function" html='<msub><mi>T</mi><mrow><mi>n</mi><mo>,</mo><mi>j</mi></mrow></msub><mo>=</mo><mi>y</mi><mo>[</mo><mi>n</mi><mo>]</mo><msub><mi>b</mi><mi>j</mi></msub><mo>[</mo><mi>n</mi><mo>]</mo>' />
          <p>These columns represent candidate mirror-error components. Multiplication by the target generally destroys the orthogonality of the original basis, so the coefficients are fitted jointly. Define the Gram matrix and scaled ridge parameter as</p>
          <Equation id={5} label="Gram matrix and energy-scaled ridge regularization" html='<mi>G</mi><mo>=</mo><msup><mi>T</mi><mi>⊤</mi></msup><mi>T</mi><mo>,</mo><mspace width="1em"/><mi>α</mi><mo>=</mo><mi>λ</mi><mi mathvariant="normal">max</mi><mo>(</mo><mfrac><mrow><mi mathvariant="normal">tr</mi><mo>(</mo><mi>G</mi><mo>)</mo></mrow><mi>K</mi></mfrac><mo>,</mo><mi>ε</mi><mo>)</mo>' />
          <p>The coefficient vector and fitted mirror component are then given by</p>
          <Equation id={6} label="Solve the ridge system and reconstruct the mirror component" html='<mtable rowspacing="0.65em"><mtr><mtd><mo>(</mo><mi>G</mi><mo>+</mo><mi>α</mi><mi>I</mi><mo>)</mo><mi>c</mi><mo>=</mo><msup><mi>T</mi><mi>⊤</mi></msup><mi>e</mi></mtd></mtr><mtr><mtd><msub><mover><mi>e</mi><mo>^</mo></mover><mtext>mirror</mtext></msub><mo>=</mo><mi>T</mi><mi>c</mi></mtd></mtr></mtable>' />
          <p>The reference implementation uses λ = 10<sup>−6</sup> and ε = 10<sup>−12</sup>, and solves the linear system directly. Scaling the ridge penalty by the mean Gram diagonal makes the regularization follow signal energy, except near the numerical floor. The energies used in Eq. <a href="#eq-s1">(S1)</a> are</p>
          <Equation id={7} label="Mirror energy equals the squared norm of the fitted waveform; error energy equals the squared norm of total error" html={`${em}<mo>=</mo><msup><mrow><mo>‖</mo><mi>T</mi><mi>c</mi><mo>‖</mo></mrow><mn>2</mn></msup><mo>=</mo><msup><mi>c</mi><mi>⊤</mi></msup><mi>G</mi><mi>c</mi><mo>,</mo><mspace width="1em"/>${ee}<mo>=</mo><msup><mrow><mo>‖</mo><mi>e</mi><mo>‖</mo></mrow><mn>2</mn></msup>`} />
          <p>All energies are sums of squared samples. Reversing the sign convention for <i>e</i> leaves both energies unchanged. With nonzero ridge, the fitted energy is not exactly the reduction in residual energy of an orthogonal least-squares projection.</p>
        </section>

        <section id="interpretation">
          <h2>S3. Interpretation and numerical limits</h2>
          <p>When stabilization is negligible, HA-MAI<sub>error</sub> ≈ 10 log<sub>10</sub>(<i>E</i><sub>m</sub>/<i>E</i><sub>e</sub>). Values of 0, −10, −20, and −30 dB correspond approximately to mirror shares of 100%, 10%, 1%, and 0.1%, respectively. More negative values indicate a smaller fitted periodic share, without necessarily indicating lower total error.</p>
          <p>For nonnegative ridge, the fitted operator is a contraction on the same evaluation samples, giving 0 ≤ <i>E</i><sub>m</sub> ≤ <i>E</i><sub>e</sub>. Therefore, for fixed <i>E</i><sub>e</sub> and ε &gt; 0,</p>
          <Equation id={8} label="Exact lower and upper bounds for fixed error energy" html={`<mn>10</mn><msub><mi mathvariant="normal">log</mi><mn>10</mn></msub><mfrac><mi>ε</mi><mrow>${ee}<mo>+</mo><mi>ε</mi></mrow></mfrac><mo>≤</mo>${metric}<mo>≤</mo><mn>0</mn>`} />
          <p>There is no finite lower bound independent of the error energy. If <i>E</i><sub>e</sub> = <i>E</i><sub>m</sub> = 0, Eq. <a href="#eq-s1">(S1)</a> returns 0 dB because the stabilized ratio is ε/ε. This case must be identified as <em>no error</em>, rather than interpreted as a high mirror share. Near-zero error is also dominated by stabilization. A silent target makes the template detector uninformative.</p>
          <p>The related linear fraction is <i>F</i> = <i>E</i><sub>m</sub>/(<i>E</i><sub>e</sub> + ε). Its exact relationship to the dB metric is</p>
          <Equation id={9} label="Exact relationship between HA-MAI error and the stabilized linear fraction" html={`${metric}<mo>=</mo><mn>10</mn><msub><mi mathvariant="normal">log</mi><mn>10</mn></msub><mo>(</mo><mi>F</mi><mo>+</mo><mfrac><mi>ε</mi><mrow>${ee}<mo>+</mo><mi>ε</mi></mrow></mfrac><mo>)</mo>`} />
          <p><strong>Limitations.</strong> Adding unrelated prediction error may reduce HA-MAI<sub>error</sub> by increasing its denominator. Conversely, a small error lying entirely in the periodic template space may produce a value close to 0 dB. The index should therefore be reported with a waveform metric such as NMSE or SI-SDR. Mirror energy relative to target energy, <i>E</i><sub>m</sub>/<i>E</i><sub>t</sub> with <i>E</i><sub>t</sub> = ‖<i>y</i>‖², provides complementary information about artifact magnitude. Changing <i>P</i> changes the fitted space; scores at different periods should not be treated as sharing a universal threshold.</p>
        </section>

        <section id="evidence">
          <h2>S4. Boundary experiments</h2>
          <p>The reference experiment used 30 clean target utterances, with 10 each from LibriSpeech, TIMIT, and AISHELL-1. Two constructed predictions were evaluated at <i>P</i> = 2, 4, 8, and 16:</p>
          <ol className="conditions">
            <li><strong>Periodic mirror error:</strong> ŷ = <i>y</i> + 0.2<i>yg</i>, where <i>g</i> is a zero-mean <i>P</i>-periodic modulation with unit RMS over one period. The error lies in the template space.</li>
            <li><strong>Gaussian prediction:</strong> the entire prediction ŷ is independent Gaussian noise, scaled to the target RMS. Five fixed seeds yield 150 evaluations per period.</li>
          </ol>
          <div className="table-block">
            <p className="paper-table-caption"><strong className="table-label">Table S2.</strong> Boundary results, pooled by energy after independent fitting. Mirror share is 100<i>F</i> (%); HA-MAI is the error-normalized metric in Eq. <a href="#eq-s1">(S1)</a>. Values are rounded from the reference summary dated 8 September 2026.</p>
            <Table>
              <TableHeader>
                <TableRow><TableHead scope="col" rowSpan={2}><i>P</i></TableHead><TableHead scope="col" rowSpan={2}><i>K</i></TableHead><TableHead scope="colgroup" colSpan={2}>Periodic mirror error</TableHead><TableHead scope="colgroup" colSpan={2}>Gaussian prediction</TableHead></TableRow>
                <TableRow><TableHead scope="col">Share (%)</TableHead><TableHead scope="col">HA-MAI (dB)</TableHead><TableHead scope="col">Share (%)</TableHead><TableHead scope="col">HA-MAI (dB)</TableHead></TableRow>
              </TableHeader>
              <TableBody>{experiment.map(row => <TableRow key={row[0]}>{row.map((v, i) => <TableCell key={i}>{v}</TableCell>)}</TableRow>)}</TableBody>
            </Table>
          </div>
          <p>The periodic construction is recovered almost completely, with a small reduction due to ridge shrinkage. Gaussian predictions exhibit a low periodic share despite poor waveform fidelity. Their error also contains −<i>y</i>, so both finite-sample target/template correlations and chance noise correlations can contribute to fitted energy. The observed random baseline increases with the basis dimension <i>K</i> = <i>P</i> − 1. These results illustrate the metric’s behavior and do not establish a universal noise floor.</p>
        </section>

        <section id="implementation">
          <h2>S5. Implementation and reporting</h2>
          <h3>S5.1. Efficient computation</h3>
          <p>The implementation accumulates target energy and target–error products separately for each phase <i>r</i> = <i>n</i> mod <i>P</i>. With <i>B</i> denoting the basis evaluated over one period, these statistics yield</p>
          <Equation id={10} label="Gram matrix and right-hand side from phase-wise sufficient statistics" html='<mtable rowspacing="0.65em"><mtr><mtd><mi>G</mi><mo>=</mo><msup><mi>B</mi><mi>⊤</mi></msup><mi mathvariant="normal">diag</mi><mo>(</mo><msub><mi>S</mi><mi>yy</mi></msub><mo>)</mo><mi>B</mi></mtd></mtr><mtr><mtd><msup><mi>T</mi><mi>⊤</mi></msup><mi>e</mi><mo>=</mo><msup><mi>B</mi><mi>⊤</mi></msup><msub><mi>S</mi><mi>ye</mi></msub></mtd></mtr></mtable>' />
          <p>Here, <i>S</i><sub>yy</sub>[<i>r</i>] = ∑<sub><i>n</i> mod <i>P</i> = <i>r</i></sub> <i>y</i>[<i>n</i>]² and <i>S</i><sub>ye</sub>[<i>r</i>] = ∑<sub><i>n</i> mod <i>P</i> = <i>r</i></sub> <i>y</i>[<i>n</i>]<i>e</i>[<i>n</i>]. This avoids storing the full <i>N</i> × (<i>P</i> − 1) template matrix. Even at <i>P</i> = 16, the ridge system contains only 15 unknowns.</p>
          <h3>S5.2. Dataset aggregation</h3>
          <p>Fit the coefficient vector independently for every utterance. For an energy-pooled result, sum the fitted mirror and error energies before evaluating the ratio:</p>
          <Equation id={11} label="Energy-pooled HA-MAI error across independently fitted utterances" html='<msub><mtext>HA-MAI</mtext><mtext>error, pooled</mtext></msub><mo>=</mo><mn>10</mn><msub><mi mathvariant="normal">log</mi><mn>10</mn></msub><mfrac><mrow><munder><mo>∑</mo><mi>i</mi></munder><msub><mi>E</mi><mrow><mi>m</mi><mo>,</mo><mi>i</mi></mrow></msub><mo>+</mo><mi>ε</mi></mrow><mrow><munder><mo>∑</mo><mi>i</mi></munder><msub><mi>E</mi><mrow><mi>e</mi><mo>,</mo><mi>i</mi></mrow></msub><mo>+</mo><mi>ε</mi></mrow></mfrac>' />
          <p>A macro mean instead averages utterance-level dB scores and is not equivalent to Eq. <a href="#eq-s11">(S11)</a>. Report the aggregation rule, period, basis convention, ridge strength, stabilizer, sample rate, alignment procedure, evaluation length, and valid-sample counts. Use identical settings and evaluation samples across methods.</p>
          <h3>S5.3. Reference files</h3>
          <p>The <a href="./hamai.py" download>NumPy implementation (hamai.py)</a> uses the settings specified in Section S2.3. Inputs must be finite, aligned, one-dimensional waveforms of equal length. The implementation preserves Eq. <a href="#eq-s1">(S1)</a> and returns status labels for <code>no_error</code>, <code>low_error</code>, and <code>silent_target</code>. Its low-error reporting convention is <i>E</i><sub>e</sub> ≤ 100ε; this threshold is not part of the metric definition.</p>
          <pre><code>{`from hamai import hamai_error

result = hamai_error(target, estimate, period=4)
print(result["hamai_error_db"])
print(result["status"])`}</code></pre>
          <p>The <a href="./data/boundary-summary.csv" download>boundary-experiment summary (CSV)</a> provides the unrounded values underlying Table S2. Website source and numerical checks are available in the <a href="https://github.com/ZhaoF-i/future-signal-prediction">project repository</a>.</p>
        </section>
        <footer className="paper-footer">Supplementary material · HA-MAI<sub>error</sub></footer>
      </main>
    </>
  );
}
