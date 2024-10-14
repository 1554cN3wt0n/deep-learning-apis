const fs = require("fs");
const path = require("path");
const logger = require("../logger");

let imageClassificationPipeline;
let objectDetectionPipeline;

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

// loadImageClassificationModel();
// loadObjectDetectionModel();

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

module.exports = {
  classifyImage,
  detectObjects,
};
