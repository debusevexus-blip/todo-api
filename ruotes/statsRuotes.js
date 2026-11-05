const express = require("express");
const router = express.Router();

const Todo = require("../models/Todo");
const Category = require("../models/Category");

// Middleware API Key
const apiKeyAuth = require("../middleware/apiKeyauth");

// ======================================
// GET /api/stats/summary
// Statistik Todo
// ======================================

router.get("/summary", apiKeyAuth, async (req, res, next) => {
    try {

        // Menghitung seluruh Todo
        const totalTodo = await Todo.countDocuments();

        // Menghitung Todo yang sudah selesai
        const completedTodo = await Todo.countDocuments({
            completed: true
        });

        // Menghitung Todo yang masih pending
        const pendingTodo = await Todo.countDocuments({
            completed: false
        });

        // Menghitung seluruh kategori
        const totalCategory = await Category.countDocuments();

        // Menghitung persentase Todo selesai
        const completionPercentage = totalTodo > 0
            ? Number(((completedTodo / totalTodo) * 100).toFixed(2))
            : 0;

        res.status(200).json({
            success: true,
            message: "Statistik Todo berhasil diambil.",

            data: {
                totalTodo,
                completedTodo,
                pendingTodo,
                totalCategory,
                completionPercentage: completionPercentage + "%"
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;