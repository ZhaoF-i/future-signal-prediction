# Example media credits

These are selected qualitative examples for the HA-MAI supplement, not dataset-wide results. Target excerpts and their model-derived predictions are provided with the following attribution and license notices. No endorsement by the dataset creators is implied.

## Speech: LibriSpeech

`speech-target.wav`, `speech-baseline.wav`, `speech-suppressed.wav`, and `speech-spectrogram.png` derive from LibriSpeech test-clean utterance **1089-134691-0003**.
The derived `speech-baseline-error.wav`, `speech-suppressed-error.wav`, and `speech-error-spectrogram.png` retain the same attribution and license.

Credit: Vassil Panayotov, Guoguo Chen, Daniel Povey, and Sanjeev Khudanpur, *LibriSpeech: An ASR corpus based on public domain audio books*, ICASSP 2015. The corpus derives from LibriVox recordings.

Source: [LibriSpeech / OpenSLR 12](https://www.openslr.org/12/). These media are distributed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).

## Noise: DEMAND

`noise-target.wav`, `noise-baseline.wav`, `noise-suppressed.wav`, and `noise-spectrogram.png` derive from DEMAND's NPARK recording, saved evaluation segment **NPARK_S00641_seg0015**.
The derived `noise-baseline-error.wav`, `noise-suppressed-error.wav`, and `noise-error-spectrogram.png` retain the same attribution and license.

Credit: Joachim Thiemann, Nobutaka Ito, and Emmanuel Vincent, *DEMAND: a collection of multi-channel recordings of acoustic noise in diverse environments*, version 1.0, 2013, DOI: 10.5281/zenodo.1227121.

Source: [DEMAND dataset and original license notice](https://zenodo.org/records/1227121). Following the dataset description's license notice, these media and adaptations are distributed under [Creative Commons Attribution-ShareAlike 3.0 Unported](https://creativecommons.org/licenses/by-sa/3.0/).

## Changes and provenance

The prediction tracks are saved outputs of the Base and complete RandomInterval models. The exporter aligns their target intervals, selects one excerpt per corpus, applies a single gain shared by the three tracks in each example, and converts them to mono 16 kHz PCM16 WAV. It does not infer new predictions, subtract a fitted mirror waveform, loop, splice, or normalize tracks separately. The figures visualize these exported WAVs.

The additional error tracks are exact differences of the published target and predicted WAVs, with no additional gain or clipping. They represent total prediction error, not an isolated mirror waveform. Error figures use the same magnitude reference as the corresponding target/predicted-signal figure.

The author-selected LibriSpeech example uses the complete 34795-sample aligned interval (2.1746875 s), beginning at sample 0. Noise uses the complete 47995-sample common interval. The Base target and prediction lose one initial sample for alignment; the complete system is untrimmed at its start. Base and full-system prediction advances are 4 and 5 samples, respectively.

[metadata.json](metadata.json) records exact crops, shared gains, processing parameters, model commit identifiers, source WAV hashes, published asset hashes, and metrics recomputed after PCM16 decoding. File identifiers refer to saved evaluation outputs; no private filesystem paths are distributed.

## Additional test corpora

The following credits cover each dataset-prefixed target, standalone predicted signal, complete-system predicted signal, two error WAVs, and both spectrograms. Each was aligned, excerpted where stated, scaled with one common gain, quantized to PCM16, and visualized. Error audio is exact target-minus-predicted-signal subtraction. Dataset-specific terms are retained; these files are not assigned a blanket open license.

- **TIMIT TEST** (`timit-*`): DR3/MGJF0/SI1901, 49555 aligned samples. John S. Garofolo, Lori F. Lamel, William M. Fisher, Jonathan G. Fiscus, David S. Pallett, Nancy L. Dahlgren, and Victor Zue, *TIMIT Acoustic-Phonetic Continuous Speech Corpus*, LDC93S1 (1993). [Dataset and LDC terms](https://catalog.ldc.upenn.edu/LDC93S1). The research illustration does not grant rights to redistribute the TIMIT corpus.
- **AISHELL-1 test** (`aishell1-*`): BAC009S0916W0352, first 64000 aligned samples. Hui Bu, Jiayu Du, Xingyu Na, Bengu Wu, and Hao Zheng, *AISHELL-1* (2017), Beijing Shell Shell Technology Co., Ltd. [OpenSLR 33](https://www.openslr.org/33/), [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).
- **NoiseX-92** (`noisex92-*`): HF radio channel recording, saved segment hfchannel_S00624_seg0000, 47995 aligned samples. Andrew Varga and Herman J. M. Steeneken, *Assessment for automatic speech recognition: II. NOISEX-92*, Speech Communication 12 (1993), DOI 10.1016/0167-6393(93)90095-3. [SPIB source and recording description](https://spib.linse.ufsc.br/noise.html). No Creative Commons license is asserted for this source.
- **ESC-50** (`esc50-*`): 1-187207-A-20.wav (crying baby), 79995 aligned samples. Karol J. Piczak, *ESC: Dataset for Environmental Sound Classification* (2015). [ESC-50](https://github.com/karolpiczak/ESC-50), dataset license [CC BY-NC 3.0](https://creativecommons.org/licenses/by-nc/3.0/). The original recording is [More baby noises… by k3pp, Freesound 187207](https://freesound.org/people/k3pp/sounds/187207/), listed as CC0 in the [per-clip attribution](https://github.com/karolpiczak/ESC-50/blob/master/LICENSE).
