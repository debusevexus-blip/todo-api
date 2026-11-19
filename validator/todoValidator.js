const {
    body,
    param,
    validationResult
} = require("express-validator");

const mongoose = require("mongoose");

// ======================================
// VALIDATE REQUEST
// ======================================
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validasi input gagal.",
            errors: errors.array().map((error) => ({
                field: error.path,
                message: error.msg
            }))
        });
    }

    next();
};

// ======================================
// VALIDATOR CREATE TODO (POST)
// TITLE WAJIB DIISI
// ======================================
const todoValidator = [
    body("title")
        .trim()
        .notEmpty()
        .withMessage("Judul Todo wajib diisi.")
        .bail()
        .isLength({ max: 200 })
        .withMessage("Judul Todo maksimal 200 karakter."),

    body("description")
        .optional()
        .isString()
        .withMessage("Deskripsi harus berupa teks.")
        .bail()
        .isLength({ max: 1000 })
        .withMessage("Deskripsi maksimal 1000 karakter."),

    body("completed")
        .optional()
        .isBoolean()
        .withMessage("completed harus bernilai true atau false."),

    body("category")
        .optional({ values: "null" })
        .custom((value) => {
            if (value === "") return true;

            if (!mongoose.isValidObjectId(value)) {
                throw new Error("ID kategori tidak valid.");
            }

            return true;
        }),

    validateRequest
];

// ======================================
// VALIDATOR UPDATE TODO (PUT)
// SEMUA FIELD OPSIONAL
// MINIMAL SATU FIELD DIKIRIM
// ======================================
const todoUpdateValidator = [

    // Minimal satu field harus dikirim
    (req, res, next) => {
        const allowedFields = [
            "title",
            "description",
            "completed",
            "category"
        ];

        const hasField = allowedFields.some((field) =>
            Object.prototype.hasOwnProperty.call(req.body, field)
        );

        if (!hasField) {
            return res.status(400).json({
                success: false,
                message: "Minimal satu field harus dikirim untuk update."
            });
        }

        next();
    },

    body("title")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Judul Todo tidak boleh kosong.")
        .bail()
        .isLength({ max: 200 })
        .withMessage("Judul Todo maksimal 200 karakter."),

    body("description")
        .optional()
        .isString()
        .withMessage("Deskripsi harus berupa teks.")
        .bail()
        .isLength({ max: 1000 })
        .withMessage("Deskripsi maksimal 1000 karakter."),

    body("completed")
        .optional()
        .isBoolean()
        .withMessage("completed harus bernilai true atau false."),

    body("category")
        .optional({ values: "null" })
        .custom((value) => {
            if (value === "") return true;

            if (!mongoose.isValidObjectId(value)) {
                throw new Error("ID kategori tidak valid.");
            }

            return true;
        }),

    validateRequest
];

// ======================================
// VALIDATOR TODO ID
// ======================================
const todoIdValidator = [
    param("id")
        .custom((value) => mongoose.isValidObjectId(value))
        .withMessage("ID Todo tidak valid."),

    validateRequest
];

module.exports = {
    todoValidator,
    todoUpdateValidator,
    todoIdValidator
};