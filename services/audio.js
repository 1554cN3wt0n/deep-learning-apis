const logger = require("../logger");
const fs = require("fs");
wavefile = require("wavefile");

let asrPipeline;
let ttsPipeline;

// Function to load the ASR pipeline using the whisper-tiny model
async function loadASRModel() {
  if (!asrPipeline) {
    const { pipeline } = await import("@huggingface/transformers");
    asrPipeline = await pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-tiny.en"
    );
    logger.info("ASR model loaded (whisper-tiny.en).");
  }
}

// Function to load the TTS pipeline
async function loadTTSPipeline() {
  if (!ttsPipeline) {
    const { pipeline } = await import("@huggingface/transformers");
    ttsPipeline = await pipeline("text-to-speech", "Xenova/speecht5_tts", {
      quantized: false,
    });
    logger.info("TTS model loaded (SpeechT5).");
  }
}

if (process.env.LOAD_AUDIO && process.env.LOAD_AUDIO == "1") {
  loadASRModel(); // Load the automatic speech recognition model on server start
  loadTTSPipeline(); // Load the text-to-speech model on server start
}

// Function to perform ASR on an audio file (or buffer)
async function transcribeAudio(audioPath) {
  try {
    // Ensure the model is loaded
    await loadASRModel();

    // Run ASR on the audio
    audioInput = await processAudio(audioPath);

    const transcription = await asrPipeline(audioInput);
    return transcription.text; // Return the transcribed text
  } catch (error) {
    logger.error("Error during ASR:", error);
    throw new Error("ASR transcription failed");
  }
}

// Function to synthesize speech
async function synthesizeSpeech(text) {
  try {
    await loadTTSPipeline();
    const speaker_embeddings =
      "https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/speaker_embeddings.bin";
    const output = await ttsPipeline(text, { speaker_embeddings });
    // Convert Float32Array to WAV
    const wav = new wavefile.WaveFile();
    wav.fromScratch(1, output.sampling_rate, "32f", output.audio); // 1 channel, 16000 sample rate, 32-bit float
    const wavBuffer = wav.toBuffer(); // Get WAV buffer
    return wavBuffer; // This will include audio data
  } catch (error) {
    logger.error("Error during TTS synthesis:", error);
    throw new Error("Text-to-speech synthesis failed");
  }
}

async function processAudio(filePath) {
  // Load audio data from file system
  const buffer = fs.readFileSync(filePath);

  // Read .wav file and convert it to required format
  const wav = new wavefile.WaveFile(buffer);
  wav.toBitDepth("32f"); // Convert to Float32
  wav.toSampleRate(16000); // Whisper expects audio with a sampling rate of 16000
  let audioData = wav.getSamples();
  audioData = [audioData];
  if (Array.isArray(audioData)) {
    if (audioData.length > 1) {
      const SCALING_FACTOR = Math.sqrt(2);

      // Merge channels (into first channel to save memory)
      for (let i = 0; i < audioData[0].length; ++i) {
        audioData[0][i] =
          (SCALING_FACTOR * (audioData[0][i] + audioData[1][i])) / 2;
      }
    }

    // Select first channel
    audioData = audioData[0];
    return audioData;
  } else {
    throw new Error("Audio data is not in the expected format");
  }
}

module.exports = {
  transcribeAudio,
  synthesizeSpeech,
};
