// routes/asr.js
const express = require("express");
const multer = require("multer");
const { transcribeAudio, synthesizeSpeech } = require("../services/audio");
const router = express.Router();

// Configure multer for audio uploads
const upload = multer({ dest: "uploads/" });

// POST endpoint for ASR
/**
 * @swagger
 * /audio/transcribe:
 *   post:
 *     summary: Transcribe speech from an uploaded audio file using the Whisper-tiny model
 *     tags: [Audio]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               audio:
 *                 type: string
 *                 format: binary
 *                 description: The audio file to be transcribed
 *     responses:
 *       200:
 *         description: Transcription result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transcription:
 *                   type: string
 *                   description: The transcribed text
 *       400:
 *         description: Bad request, audio file is missing
 *       500:
 *         description: Transcription failed
 */
router.post("/transcribe", upload.single("audio"), async (req, res) => {
  const audioPath = req.file.path;

  if (!audioPath) {
    return res.status(400).json({ error: "Audio file is required" });
  }

  try {
    const transcription = await transcribeAudio(audioPath);
    res.status(200).json({ transcription });
  } catch (error) {
    res.status(500).json({ error: "Failed to transcribe audio" });
  }
});

// GET endpoint for TTS
/**
 * @swagger
 * /audio/synthesize:
 *   get:
 *      summary: Synthesize speech from text
 *      tags: [Audio]
 *      parameters:
 *        - in: query
 *          name: text
 *          required: true
 *          schema:
 *            type: string
 *          description: Text to synthesize speech from
 *          example: "Hello, my dog is cute."
 *      responses:
 *        '200':
 *          description: Speech synthesized successfully
 *          content:
 *            audio/wav:
 *              schema:
 *                type: string
 *                format: binary
 *        '400':
 *          description: Bad request
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 *        '500':
 *          description: Internal server error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  error:
 *                    type: string
 */
router.get("/synthesize", async (req, res) => {
  const { text } = req.query; // Get text from query parameters

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  try {
    const audioOutput = await synthesizeSpeech(text);
    res.setHeader("Content-Type", "audio/wav"); // Set the content type to audio/wav
    res.status(200);
    res.send(audioOutput); // Send the WAV audio buffer as response
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to synthesize speech" });
  }
});

module.exports = router;
