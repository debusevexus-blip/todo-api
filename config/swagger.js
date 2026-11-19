const swaggerJsDoc = require("swagger-jsdoc");
const path = require("path");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Todo API",
            version: "1.0.0",
            description: "Dokumentasi REST API Todo"
        },
       servers: [
  { url: "/", description: "Current Server (Auto Detect / Vercel)" },
  { url: "http://localhost:3000", description: "Local development server" },
],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                },
                ApiKeyAuth: {
                    type: "apiKey",
                    in: "header",
                    name: "x-api-key"
                }
            }
        }
    },

    apis: [
        path.join(__dirname, "../app.js"),
        path.join(__dirname, "../ruotes/todoRuotes.js"),
        path.join(__dirname, "../ruotes/categoryRuotes.js"),
        path.join(__dirname, "../ruotes/activityLogRoutes.js"),
        path.join(__dirname, "../ruotes/statsRuotes.js")
    ]
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;
