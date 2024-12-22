const logger = require("../logger");

let textGenerationPipeline;
let qaPipeline;
let similarityPipeline;

// Load the transformer model (GPT-2 in this case)
async function loadTextGenerationModel() {
  if (!textGenerationPipeline) {
    const transformers = await import("@huggingface/transformers");
    textGenerationPipeline = await transformers.pipeline(
      "text-generation",
      "HuggingFaceTB/SmolLM-135M",
      {
        device: "cpu",
        model_file_name: "model",
      }
    );
    logger.info("Text generation model loaded!");
  }
}

// Load the QA model (DistilBERT in this case) if not already loaded
async function loadQAModel() {
  if (!qaPipeline) {
    const transformers = await import("@huggingface/transformers");
    qaPipeline = await transformers.pipeline(
      "question-answering",
      "Xenova/distilbert-base-cased-distilled-squad"
    );
    logger.info("Question Answering model loaded");
  }
}

// Load the model for sentence similarity if not already loaded
async function loadSimilarityModel() {
  if (!similarityPipeline) {
    const transformers = await import("@huggingface/transformers");
    similarityPipeline = await transformers.pipeline(
      "feature-extraction",
      "sentence-transformers/all-MiniLM-L6-v2"
    );
    logger.info("Sentence similarity model loaded");
  }
}

if (process.env.LOAD_NLP && process.env.LOAD_NLP == "1") {
  loadTextGenerationModel(); // Load the text generation model on server start
  loadQAModel(); // Load the question answering model on server start
  loadSimilarityModel(); // Load the question answering model on server start
}

// Generate text based on the input prompt
async function generateText(prompt, options = {}) {
  try {
    // Ensure the model is loaded before generating text
    await loadTextGenerationModel();

    // Generate text
    const result = await textGenerationPipeline(prompt, { ...options });
    return result[0].generated_text;
  } catch (error) {
    logger.error("Error during text generation:", error);
    throw new Error("Text generation failed");
  }
}

// Function to answer questions based on context
async function answerQuestion(question, context) {
  try {
    await loadQAModel(); // Ensure the QA model is loaded
    const result = await qaPipeline(question, context);
    return result.answer;
  } catch (error) {
    logger.error("Error during question answering:", error);
    throw new Error("Question answering failed");
  }
}

// Function to compute sentence similarity
async function computeSimilarity(sentenceRef, sentenceArray) {
  try {
    await loadSimilarityModel(); // Ensure the similarity model is loaded

    // Compute embeddings for sentenceRef and each sentence in sentenceArray
    const sentenceRefEmbedding = await similarityPipeline(sentenceRef);
    const sentenceArrayEmbeddings = await Promise.all(
      sentenceArray.map((sentence) => similarityPipeline(sentence))
    );

    // Extract the embeddings (assuming the embeddings are in the first element)
    const vecA = Array.isArray(sentenceRefEmbedding)
      ? sentenceRefEmbedding[0]
      : sentenceRefEmbedding;

    // Compute cosine similarities between sentenceRef and each sentence in sentenceArray
    const similarityScores = sentenceArrayEmbeddings.map((embedding, index) => {
      const vecB = Array.isArray(embedding) ? embedding[0] : embedding;
      return {
        sentence: sentenceArray[index],
        similarity: cosineSimilarity(vecA.data, vecB.data),
      };
    });

    return similarityScores;
  } catch (error) {
    logger.error("Error during sentence similarity computation:", error);
    throw new Error("Sentence similarity computation failed");
  }
}

// Helper function to calculate cosine similarity
function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce(
    (sum, value, index) => sum + value * vecB[index],
    0
  );
  const magnitudeA = Math.sqrt(
    vecA.reduce((sum, value) => sum + value ** 2, 0)
  );
  const magnitudeB = Math.sqrt(
    vecB.reduce((sum, value) => sum + value ** 2, 0)
  );
  return dotProduct / (magnitudeA * magnitudeB);
}

module.exports = {
  generateText,
  answerQuestion,
  computeSimilarity,
};
