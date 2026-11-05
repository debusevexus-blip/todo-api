const express = require("express");
const router = express.Router();

const ActivityLog = require("../models/ActivityLog");
const protect = require("../middleware/protect");

// GET /api/activity-logs
// Melihat riwayat aktivitas pengguna yang login
router.get("/", protect, async (req, res) => {
    try {
        const logs = await ActivityLog.find({
            user: req.user._id
        })
            .populate("todo", "title")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Riwayat aktivitas berhasil diambil",
            total: logs.length,
            data: logs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Gagal mengambil riwayat aktivitas",
            error: error.message
        });
    }
});

module.exports = router;
