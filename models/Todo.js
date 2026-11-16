const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
    {
        // Judul Todo
        title: {
            type: String,
            required: true,
            trim: true
        },

        // Deskripsi Todo
        description: {
            type: String,
            default: ""
        },

        // Status Todo
        completed: {
            type: Boolean,
            default: false
        },

        // Pemilik Todo
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Kategori Todo
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null
        },

        // User yang membuat Todo
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // User yang terakhir mengubah Todo
        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // Status arsip Todo
        archived: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Todo", todoSchema);
