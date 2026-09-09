# Example media credits

These are selected qualitative examples for the HA-MAI supplement, not dataset-wide results. Target excerpts and their model-derived predictions are provided with the following attribution and license notices. No endorsement by the dataset creators is implied.

## Speech: LibriSpeech

`speech-target.wav`, `speech-baseline.wav`, `speech-suppressed.wav`, and `speech-spectrogram.png` derive from LibriSpeech test-clean utterance **7021-79759-0004**.

Credit: Vassil Panayotov, Guoguo Chen, Daniel Povey, and Sanjeev Khudanpur, *LibriSpeech: An ASR corpus based on public domain audio books*, ICASSP 2015. The corpus derives from LibriVox recordings.

Source: [LibriSpeech / OpenSLR 12](https://www.openslr.org/12/). These media are distributed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/).

## Noise: DEMAND

`noise-target.wav`, `noise-baseline.wav`, `noise-suppressed.wav`, and `noise-spectrogram.png` derive from DEMAND's NPARK recording, saved evaluation segment **NPARK_S00641_seg0015**.

Credit: Joachim Thiemann, Nobutaka Ito, and Emmanuel Vincent, *DEMAND: a collection of multi-channel recordings of acoustic noise in diverse environments*, version 1.0, 2013, DOI: 10.5281/zenodo.1227121.

Source: [DEMAND dataset and original license notice](https://zenodo.org/records/1227121). Following the dataset description's license notice, these media and adaptations are distributed under [Creative Commons Attribution-ShareAlike 3.0 Unported](https://creativecommons.org/licenses/by-sa/3.0/).

## Changes and provenance

The prediction tracks are saved outputs of the Base and complete RandomInterval models. The exporter aligns their target intervals, selects one excerpt per domain, applies a single gain shared by the three tracks in each domain, and converts them to mono 16 kHz PCM16 WAV. It does not infer new predictions, subtract a fitted mirror waveform, loop, splice, or normalize tracks separately. The figures visualize these exported WAVs.

Speech uses 64000 samples starting at sample 176000 of the aligned interval. Noise uses the complete 47995-sample common interval. The Base target and prediction lose one initial sample for alignment; the complete system is untrimmed at its start. Base and full-system prediction advances are 4 and 5 samples, respectively.

[metadata.json](metadata.json) records exact crops, shared gains, processing parameters, model commit identifiers, source WAV hashes, published asset hashes, and metrics recomputed after PCM16 decoding. File identifiers refer to saved evaluation outputs; no private filesystem paths are distributed.
