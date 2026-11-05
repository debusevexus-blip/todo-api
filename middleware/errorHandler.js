const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Terjadi kesalahan pada server.";

    // ID MongoDB tidak valid
    if (err.name === "CastError") {
        statusCode = 400;
        message = "Format ID tidak valid.";
    }

    // Data duplikat, misalnya email yang sudah terdaftar
    if (err.code === 11000) {
        statusCode = 409;
        message = "Data sudah terdaftar.";
    }

    // Validasi bawaan Mongoose
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Data tidak memenuhi aturan validasi.";
    }

    res.status(statusCode).json({
        success: false,
        message
    });
};

module.exports = errorHandler;

