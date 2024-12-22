const express = require("express");
const multer = require("multer");
const router = express.Router();
const logger = require("../logger");

const {
  classifyImage,
  detectObjects,
  segmentImage,
} = require("../services/vision");

// Configure multer for image uploads
const upload = multer({ dest: "uploads/" });

// POST endpoint for image classification
/**
 * @swagger
 * /vision/classify:
 *   post:
 *     summary: Classify an uploaded image
 *     tags: [Vision]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image to classify
 *     responses:
 *       200:
 *         description: Image classification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 classification:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       label:
 *                         type: string
 *                       score:
 *                         type: number
 *       400:
 *         description: Bad request, image file is missing
 *       500:
 *         description: Image classification failed
 */

router.post("/classify", upload.single("image"), async (req, res) => {
  const imagePath = req.file.path;

  if (!imagePath) {
    return res.status(400).json({ error: "Image file is required" });
  }

  try {
    const classificationResults = await classifyImage(imagePath);
    res.status(200).json({ classification: classificationResults });
  } catch (error) {
    res.status(500).json({ error: "Failed to classify image" });
  }
});

// POST endpoint for object detection
/**
 * @swagger
 * /vision/detect:
 *   post:
 *     summary: Detect objects in an uploaded image using a DETR model
 *     tags: [Vision]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image to detect objects in
 *     responses:
 *       200:
 *         description: Object detection result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 objects:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       label:
 *                         type: string
 *                       score:
 *                         type: number
 *                       boundingBox:
 *                         type: object
 *                         properties:
 *                           x:
 *                             type: number
 *                           y:
 *                             type: number
 *                           width:
 *                             type: number
 *                           height:
 *                             type: number
 *       400:
 *         description: Bad request, image file is missing
 *       500:
 *         description: Object detection failed
 */
router.post("/detect", upload.single("image"), async (req, res) => {
  const imagePath = req.file.path;

  if (!imagePath) {
    return res.status(400).json({ error: "Image file is required" });
  }

  try {
    const detectedObjects = await detectObjects(imagePath);
    res.status(200).json({ objects: detectedObjects });
  } catch (error) {
    res.status(500).json({ error: "Failed to detect objects" });
  }
});

// POST endpoint for image segmentation
/**
 * @swagger
 * /vision/segment:
 *   post:
 *     summary: Segment an image using a MobileVIT model
 *     tags: [Vision]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The image to be segmented
 *     responses:
 *       200:
 *         description: Image segmentation result
 *         content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: The segmented image
 *       400:
 *         description: Bad request, image file is missing
 *       500:
 *         description: Image segmentation failed
 */
router.post("/segment", upload.single("image"), async (req, res) => {
  const imagePath = req.file.path;

  if (!imagePath) {
    return res.status(400).json({ error: "Image file is required" });
  }

  try {
    const imageSegmented = await segmentImage(imagePath);
    res.status(200).json({
      segmentation: imageSegmented.map((e) => {
        return { label: e.label, score: e.score };
      }),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to segment image" });
  }
});

module.exports = router;
