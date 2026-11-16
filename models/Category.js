const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // User yang membuat kategori
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // User yang terakhir mengubah kategori
        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // Status arsip kategori
        archived: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Category", categorySchema);
