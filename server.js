const express = require("express");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const apiRoutes = require("./routes/api"); // Import the API routes
const nlpRoutes = require("./routes/nlp");
const visionRoutes = require("./routes/vision");
const audioRoutes = require("./routes/audio");
const logger = require("./logger");

const app = express();
const port = 3000;

app.use(express.json()); // for parsing application/json

// Swagger options
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Simple API",
      version: "1.0.0",
      description: "A simple API with Swagger documentation",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/*.js"], // Define where to look for the docs
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Use the api.js routes
app.use("/api", apiRoutes); // Mount the api routes under /api path

app.use("/nlp", nlpRoutes); // Mount the NLP routes under /nlp path

app.use("/vision", visionRoutes); // Mount the Vision routes under /vision path

app.use("/audio", audioRoutes); // Mount the Audio routes under /audio path

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
