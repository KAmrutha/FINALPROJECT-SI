const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const { ComputerVisionClient } = require('@azure/cognitiveservices-computervision');
const { CognitiveServicesCredentials } = require('@azure/ms-rest-azure-js');
require('dotenv').config();

const app = express();
app.use(express.json());

const visionProcessor = new ComputerVisionClient(
    new CognitiveServicesCredentials(process.env.AZURE_API_KEY),
    process.env.AZURE_ENDPOINT
);

const checkImageUrl = (req, res, next) => {
    const { imageUrl } = req.body;
    if (!imageUrl) {
        return res.status(400).json({ error: 'Image URL is required' });
    }
    try {
        new URL(imageUrl);
        next();
    } catch (error) {
        res.status(400).json({ error: 'Invalid URL format' });
    }
};

const processError = (err, res) => {
    console.error('Error:', err);
    res.status(500).json({
        error: err.message || 'An error occurred during image analysis'
    });
};

const apiDocConfig = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Azure AI Image Analysis',
            version: '1.0.0',
            description: 'Comprehensive API for Computer Vision Analysis'
        },
        servers: [
            {
                url: process.env.API_BASE_URL || 'http://157.230.209.216:5000',
                description: 'Development server'
            }
        ]
    },
    apis: ['./app.js']
};

const apiDocs = swaggerJsdoc(apiDocConfig);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(apiDocs));

// API Routes

/**
 * @swagger
 * /api/vision/analyze:
 *   post:
 *     summary: Comprehensive image analysis
 *     tags: [Vision Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: URL of the image to analyze
 *     responses:
 *       200:
 *         description: Successful analysis
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
app.post("/api/vision/analyze", checkImageUrl, async (req, res) => {
    const analysisFeatures = [
        "ImageType",
        "Faces",
        "Adult",
        "Categories",
        "Color",
        "Tags",
        "Description",
        "Objects",
        "Brands"
    ];
    const specialFeatures = ['Landmarks'];
    
    try {
        const analysis = await visionProcessor.analyzeImage(req.body.imageUrl, {
            visualFeatures: analysisFeatures,
            details: specialFeatures
        });
        res.json(analysis);
    } catch(err) {
        processError(err, res);
    }
});

/**
 * @swagger
 * /api/vision/tags:
 *   post:
 *     summary: Detect tags in an image
 *     tags: [Vision Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: URL of the image to analyze
 *     responses:
 *       200:
 *         description: Successful analysis
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
app.post("/api/vision/tags", checkImageUrl, async(req, res) => {
    try {
        const analysis = await visionProcessor.analyzeImage(req.body.imageUrl, {
            visualFeatures: ['Tags']
        });
        res.json(analysis.tags);
    } catch(err) {
        processError(err, res);
    }
});

/**
 * @swagger
 * /api/vision/objects:
 *   post:
 *     summary: Detect objects in an image
 *     tags: [Vision Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: URL of the image to analyze
 *     responses:
 *       200:
 *         description: Successful analysis
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
app.post("/api/vision/objects", checkImageUrl, async (req, res) => {
    try {
        const analysis = await visionProcessor.detectObjects(req.body.imageUrl);
        res.json(analysis);
    } catch(err) {
        processError(err, res);
    }
});

/**
 * @swagger
 * /api/vision/describe:
 *   post:
 *     summary: Get image description
 *     tags: [Vision Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: URL of the image to analyze
 *     responses:
 *       200:
 *         description: Successful analysis
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
app.post("/api/vision/describe", checkImageUrl, async (req, res) => {
    try {
        const analysis = await visionProcessor.describeImage(req.body.imageUrl);
        res.json(analysis);
    } catch(err) {
        processError(err, res);
    }
});

/**
 * @swagger
 * /api/vision/text:
 *   post:
 *     summary: Recognize text in an image
 *     tags: [Vision Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: URL of the image to analyze
 *     responses:
 *       200:
 *         description: Successful analysis
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
app.post("/api/vision/text", checkImageUrl, async (req, res) => {
    try {
        const analysis = await visionProcessor.recognizePrintedText(false, req.body.imageUrl);
        res.json(analysis);
    } catch(err) {
        processError(err, res);
    }
});

/**
 * @swagger
 * /api/vision/faces:
 *   post:
 *     summary: Detect faces in an image
 *     tags: [Vision Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: URL of the image to analyze
 *     responses:
 *       200:
 *         description: Successful analysis
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
app.post("/api/vision/faces", checkImageUrl, async (req, res) => {
    try {
        const analysis = await visionProcessor.analyzeImage(req.body.imageUrl, {
            visualFeatures: ['Faces']
        });
        res.json(analysis.faces);
    } catch(err) {
        processError(err, res);
    }
});

/**
 * @swagger
 * /api/vision/colors:
 *   post:
 *     summary: Analyze colors in an image
 *     tags: [Vision Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - imageUrl
 *             properties:
 *               imageUrl:
 *                 type: string
 *                 description: URL of the image to analyze
 *     responses:
 *       200:
 *         description: Successful analysis
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
app.post("/api/vision/colors", checkImageUrl, async (req, res) => {
    try {
        const analysis = await visionProcessor.analyzeImage(req.body.imageUrl, {
            visualFeatures: ['Color']
        });
        res.json(analysis.color);
    } catch(err) {
        processError(err, res);
    }
});

const SERVER_PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
    res.json({
        message: "Welcome to Azure AI Image Analysis API",
        documentation: `${process.env.API_BASE_URL || 'http://157.230.209.216:5000/'}/api-docs`,
        note: "All endpoints need to be tested using Postman.",
        endpoints: {
            analyze: "/api/vision/analyze",
            tags: "/api/vision/tags",
            objects: "/api/vision/objects",
            describe: "/api/vision/describe",
            text: "/api/vision/text",
            faces: "/api/vision/faces",
            colors: "/api/vision/colors",
        }
    });
});
app.listen(SERVER_PORT, () => {
    console.log(`Server running on port http://157.230.209.216:${SERVER_PORT}`);
    console.log(`API documentation available at http://157.230.209.216:${SERVER_PORT}/api-docs`);
});