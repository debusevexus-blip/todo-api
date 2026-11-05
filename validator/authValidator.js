const { body, validationResult } = require("express-validator");

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

const registerValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Nama wajib diisi.")
        .bail()
        .isLength({ max: 100 })
        .withMessage("Nama maksimal 100 karakter."),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email wajib diisi.")
        .bail()
        .isEmail()
        .withMessage("Format email tidak valid.")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password wajib diisi.")
        .bail()
        .isLength({ min: 8 })
        .withMessage("Password minimal 8 karakter."),

    validateRequest
];

const loginValidator = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("Email wajib diisi.")
        .bail()
        .isEmail()
        .withMessage("Format email tidak valid.")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Password wajib diisi."),

    validateRequest
];

module.exports = {
    registerValidator,
    loginValidator
};