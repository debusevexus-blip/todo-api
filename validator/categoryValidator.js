const {
    body,
    param,
    validationResult
} = require("express-validator");

const mongoose = require("mongoose");

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

const categoryValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Nama kategori wajib diisi.")
        .bail()
        .isLength({ max: 100 })
        .withMessage("Nama kategori maksimal 100 karakter."),

    body("description")
        .optional()
        .isString()
        .withMessage("Deskripsi kategori harus berupa teks.")
        .bail()
        .isLength({ max: 500 })
        .withMessage("Deskripsi kategori maksimal 500 karakter."),

    validateRequest
];

const categoryIdValidator = [
    param("id")
        .custom((value) => mongoose.isValidObjectId(value))
        .withMessage("ID kategori tidak valid."),

    validateRequest
];

module.exports = {
    categoryValidator,
    categoryIdValidator
};