const validateTodo = (req, res, next) => {
    const { title, description, completed, category } = req.body;
    const errors = [];

    // Validasi judul
    if (typeof title !== "string" || title.trim() === "") {
        errors.push({
            field: "title",
            message: "Judul Todo wajib diisi dan harus berupa teks."
        });
    }

    // Validasi description jika dikirim
    if (
        description !== undefined &&
        typeof description !== "string"
    ) {
        errors.push({
            field: "description",
            message: "Description harus berupa teks."
        });
    }

    // Validasi completed jika dikirim
    if (
        completed !== undefined &&
        typeof completed !== "boolean"
    ) {
        errors.push({
            field: "completed",
            message: "Completed harus bernilai true atau false."
        });
    }

    // Validasi category jika dikirim
    if (
        category !== undefined &&
        category !== null &&
        (
            typeof category !== "string" ||
            !/^[0-9a-fA-F]{24}$/.test(category)
        )
    ) {
        errors.push({
            field: "category",
            message: "Category harus berupa ID MongoDB yang valid."
        });
    }

    // Jika ada kesalahan, hentikan request
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Validasi input gagal.",
            errors
        });
    }

    next();
};

module.exports = validateTodo;
