const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
    definition: {
        openapi: "3.0.0",

        info: {
            title: "Todo API Documentation",
            version: "1.0.0",
            description: "Dokumentasi API Todo menggunakan Swagger"
        },

        servers: [
            {
                url: "/",
                description: "Default server"
            }
        ],

        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },

    apis: [
        path.join(__dirname, "../ruotes/*.js")
    ]
};

const swaggerSpec = swaggerJsdoc(options);

console.log(
    "Swagger membaca endpoint:",
    Object.keys(swaggerSpec.paths || {})
);

module.exports = swaggerSpec;