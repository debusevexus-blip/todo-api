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
            {
                url: "/",
                description: "Current Server (Auto Detect / Vercel)"
            }
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
            },

            schemas: {
                Todo: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            example: "674abc123456789012345678"
                        },
                        title: {
                            type: "string",
                            example: "Belajar Backend"
                        },
                        description: {
                            type: "string",
                            example: "Belajar Express dan MongoDB"
                        },
                        completed: {
                            type: "boolean",
                            example: false
                        },
                        category: {
                            type: "string",
                            nullable: true,
                            example: null
                        },
                        user: {
                            type: "string",
                            example: "674abc123456789012345679"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time"
                        }
                    }
                },

                Category: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string"
                        },
                        name: {
                            type: "string",
                            example: "Pekerjaan"
                        },
                        description: {
                            type: "string",
                            example: "Kategori pekerjaan"
                        },
                        user: {
                            type: "string"
                        }
                    }
                },

                User: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string"
                        },
                        name: {
                            type: "string",
                            example: "Pengguna"
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "user@example.com"
                        }
                    }
                },

                ApiResponse: {
                    type: "object",
                    properties: {
                        success: {
                            type: "boolean",
                            example: true
                        },
                        message: {
                            type: "string",
                            example: "Data berhasil ditemukan"
                        }
                    }
                }
            },

            parameters: {
                Page: {
                    name: "page",
                    in: "query",
                    description: "Nomor halaman, minimal 1",
                    schema: {
                        type: "integer",
                        minimum: 1,
                        default: 1
                    }
                },

                Limit: {
                    name: "limit",
                    in: "query",
                    description: "Jumlah data per halaman, maksimal 100",
                    schema: {
                        type: "integer",
                        minimum: 1,
                        maximum: 100,
                        default: 10
                    }
                },

                Search: {
                    name: "search",
                    in: "query",
                    description: "Pencarian berdasarkan judul Todo",
                    schema: {
                        type: "string"
                    }
                },

                Completed: {
                    name: "completed",
                    in: "query",
                    description: "Filter status Todo",
                    schema: {
                        type: "boolean",
                        enum: [true, false]
                    }
                },

                CategoryFilter: {
                    name: "category",
                    in: "query",
                    description: "Filter berdasarkan ID kategori",
                    schema: {
                        type: "string"
                    }
                },

                SortBy: {
                    name: "sortBy",
                    in: "query",
                    description: "Kolom untuk pengurutan",
                    schema: {
                        type: "string",
                        enum: [
                            "title",
                            "createdAt",
                            "updatedAt",
                            "completed"
                        ],
                        default: "createdAt"
                    }
                },

                Order: {
                    name: "order",
                    in: "query",
                    description: "Urutan data",
                    schema: {
                        type: "string",
                        enum: ["asc", "desc"],
                        default: "desc"
                    }
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

console.log(
    "Swagger Schemas:",
    Object.keys(swaggerSpec.components?.schemas || {})
);

module.exports = swaggerSpec;