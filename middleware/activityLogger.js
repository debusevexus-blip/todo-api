const ActivityLog = require("../models/ActivityLog");

const logActivity = async (userId, action, details, todoId = null) => {
    try {
        await ActivityLog.create({
            user: userId,
            action: action,
            details: details,
            todo: todoId
        });
    } catch (error) {
        console.error("Gagal mencatat aktivitas:", error.message);
    }
};

module.exports = logActivity;

