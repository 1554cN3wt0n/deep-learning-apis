const express = require("express");
const logger = require("../logger");
const router = express.Router();

/**
 * @swagger
 * /api/version:
 *   get:
 *     summary: APIs version
 *     tags: [API]
 *     responses:
 *       200:
 *         description: Return the version of the api
 */
router.get("/version", (req, res) => {
  res.send("Deep Learning APIs: Version 1.0");
});

module.exports = router;
