const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");
const fs = require("fs");

const routePath = path.join(__dirname, "../ruotes/todoRuotes.js");

console.log("Lokasi file:", routePath);
console.log("File ditemukan:", fs.existsSync(routePath));

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
        url: "https://todo-api-topaz-kappa.vercel.app",
        description: "Production Server"
    },
            {
                url: "http://localhost:3000",
                description: "Local Server"
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

    apis: [routePath]
};

const swaggerSpec = swaggerJsdoc(options);

// Memeriksa apakah dokumentasi endpoint berhasil dibaca
console.log(
    "Swagger membaca endpoint:",
    Object.keys(swaggerSpec.paths || {})
);

module.exports = swaggerSpec;