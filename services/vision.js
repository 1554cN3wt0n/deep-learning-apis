const fs = require("fs");
const path = require("path");
const logger = require("../logger");

let imageClassificationPipeline;
let objectDetectionPipeline;
let imageSegmentationPipeline;

async function loadImageClassificationModel() {
  if (!imageClassificationPipeline) {
    const { pipeline } = await import("@huggingface/transformers");
    // Load the image classification pipeline
    imageClassificationPipeline = await pipeline(
      "image-classification",
      "Xenova/vit-base-patch16-224"
    );
    logger.info("Image classification model loaded.");
  }
}

// Function to load the object detection pipeline
async function loadObjectDetectionModel() {
  if (!objectDetectionPipeline) {
    const { pipeline } = await import("@huggingface/transformers");
    objectDetectionPipeline = await pipeline(
      "object-detection",
      "Xenova/detr-resnet-50"
    );
    logger.info("Object detection model loaded.");
  }
}

// Function to load the image segmentation pipeline
async function loadImageSegmentationModel() {
  if (!imageSegmentationPipeline) {
    const { pipeline } = await import("@huggingface/transformers");
    imageSegmentationPipeline = await pipeline(
      "image-segmentation",
      "Xenova/detr-resnet-50-panoptic"
    );
    logger.info("Image segmentation model loaded.");
  }
}

if (process.env.LOAD_VISION && process.env.LOAD_VISION == "1") {
  loadImageClassificationModel(); // Load the image classification model on server start
  loadObjectDetectionModel(); // Load the object detection model on server start
  loadImageSegmentationModel(); // Load the image segmentation model on server start
}

async function classifyImage(imagePath) {
  try {
    // Ensure the model is loaded
    await loadImageClassificationModel();

    // Run the image through the classification pipeline
    const results = await imageClassificationPipeline(imagePath);

    return results; // This will contain the classification results
  } catch (error) {
    logger.error("Error during image classification:", error);
    throw new Error("Image classification failed");
  }
}

// Function to detect objects in an image
async function detectObjects(imagePath) {
  try {
    // Ensure the model is loaded
    await loadObjectDetectionModel();

    // Run object detection
    const detectedObjects = await objectDetectionPipeline(imagePath);

    return detectedObjects;
  } catch (error) {
    logger.error("Error during object detection:", error);
    throw new Error("Object detection failed");
  }
}

// Function to segment an image
async function segmentImage(imagePath) {
  try {
    // Ensure the model is loaded
    await loadImageSegmentationModel();

    // Segmented image
    const segmentedImage = await imageSegmentationPipeline(imagePath);

    return segmentedImage;
  } catch (error) {
    logger.error("Error during image segmentation:", error);
    throw new Error("Image segmentation failed");
  }
}

module.exports = {
  classifyImage,
  detectObjects,
  segmentImage,
};
