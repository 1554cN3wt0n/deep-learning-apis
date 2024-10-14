const express = require("express");
const router = express.Router();
const logger = require("../logger");
const {
  generateText,
  answerQuestion,
  computeSimilarity,
} = require("../services/nlp");

// Text generation endpoint
/**
 * @swagger
 * /nlp/generate:
 *   post:
 *     summary: Send a prompt
 *     tags: [NLP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *               max_new_tokens:
 *                 type: number
 *     responses:
 *       200:
 *         description: Generated text response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 generated_text:
 *                   type: string
 *                   description: The generated text
 *       400:
 *         description: Bad request, prompt is missing
 *       500:
 *         description: Failed to generate text
 */
router.post("/generate", async (req, res) => {
  try {
    const { prompt, max_new_tokens } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Generate text based on the prompt
    const output = await generateText(prompt, {
      max_new_tokens: max_new_tokens ? max_new_tokens : 128,
    });
    res.json({ generated_text: output });
  } catch (error) {
    logger.error("Error generating text:", error);
    res.status(500).json({ error: "Failed to generate text" });
  }
});

// POST /qa - Answer a question given a context
/**
 * @swagger
 * /nlp/qa:
 *   post:
 *     summary: Answer a question based on a given context using a QA model
 *     tags: [NLP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 description: The question to be answered
 *               context:
 *                 type: string
 *                 description: The context that contains the answer to the question
 *     responses:
 *       200:
 *         description: Answer to the question based on the provided context
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 answer:
 *                   type: string
 *                   description: The answer to the question
 *       400:
 *         description: Bad request, question or context is missing
 *       500:
 *         description: Failed to answer the question
 */

router.post("/qa", async (req, res) => {
  const { question, context } = req.body;

  if (!question || !context) {
    return res.status(400).json({ error: "Question and context are required" });
  }

  try {
    const answer = await answerQuestion(question, context);
    res.status(200).json({ answer });
  } catch (error) {
    res.status(500).json({ error: "Failed to answer the question" });
  }
});

/**
 * @swagger
 * /nlp/similarity:
 *   post:
 *     summary: Compute the similarity between two sentences
 *     tags: [NLP]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sentenceRef:
 *                 type: string
 *                 description: The first sentence to compare
 *               sentenceArr:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: array of sentences that will be compared to the first sentence
 *     responses:
 *       200:
 *         description: Similarity score between the two sentences
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 similarities:
 *                   type: number
 *                   description: Cosine similarity score (between -1 and 1)
 *       400:
 *         description: Bad request, sentences are missing
 *       500:
 *         description: Failed to compute similarity
 */
router.post("/similarity", async (req, res) => {
  const { sentenceRef, sentenceArr } = req.body;

  if (!sentenceRef || !sentenceArr) {
    return res.status(400).json({ error: "Both sentences are required" });
  }

  try {
    const similarityScore = await computeSimilarity(sentenceRef, sentenceArr);
    res.status(200).json({ similarities: similarityScore });
  } catch (error) {
    res.status(500).json({ error: "Failed to compute similarity" });
  }
});

module.exports = router;
