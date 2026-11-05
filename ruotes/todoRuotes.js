const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const protect = require("../middleware/protect");
const Todo = require("../models/Todo");
const ActivityLog = require("../models/ActivityLog");

const {
    todoValidator,
    todoIdValidator
} = require("../validator/todoValidator");

// ==========================================
// GET /todos
// Filtering, Search, Sorting, Pagination
// ==========================================
/**
 * @swagger
 * /todos:
 *   get:
 *     summary: Mengambil seluruh Todo pengguna
 *     description: Menampilkan daftar Todo dengan filtering, pencarian, sorting, dan pagination.
 *     tags: [Todo]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter berdasarkan status selesai
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID kategori
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Pencarian berdasarkan judul Todo
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, createdAt, updatedAt, completed]
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar Todo
 *       401:
 *         description: Token tidak tersedia atau tidak valid
 *       400:
 *         description: Parameter filter tidak valid
 */
router.get("/", protect, async (req, res, next) => {
    try {
        // 1. FILTERING
        const filter = {
            user: req.user._id
        };

        // Filter berdasarkan status completed
        if (req.query.completed !== undefined) {
            if (!["true", "false"].includes(req.query.completed)) {
                return res.status(400).json({
                    success: false,
                    message: "completed harus true atau false."
                });
            }

            filter.completed = req.query.completed === "true";
        }

        // Filter berdasarkan kategori
        if (req.query.category) {
            if (!mongoose.isValidObjectId(req.query.category)) {
                return res.status(400).json({
                    success: false,
                    message: "ID kategori tidak valid."
                });
            }

            filter.category = req.query.category;
        }

        // 2. SEARCH
        if (req.query.search) {
            // Escape karakter khusus agar diperlakukan sebagai teks biasa
            const search = req.query.search.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.title = {
                $regex: search,
                $options: "i"
            };
        }

        // 3. PAGINATION
        const page = Math.max(
            1,
            parseInt(req.query.page, 10) || 1
        );

        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit, 10) || 10)
        );

        const skip = (page - 1) * limit;

        // 4. SORTING
        const allowedSortFields = [
            "title",
            "createdAt",
            "updatedAt",
            "completed"
        ];

        const sortBy = allowedSortFields.includes(req.query.sortBy)
            ? req.query.sortBy
            : "createdAt";

        const order = req.query.order === "asc" ? 1 : -1;

        // 5. MENGAMBIL DATA
        const total = await Todo.countDocuments(filter);

        const todos = await Todo.find(filter)
            .sort({ [sortBy]: order })
            .skip(skip)
            .limit(limit)
            .populate("user", "name email")
            .populate("category", "name");

        res.status(200).json({
            success: true,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            },
            data: todos
        });
    } catch (error) {
        next(error);
    }
});

// ====================================
// GET /todos/:id
// Mengambil satu Todo milik pengguna
// ==========================================
/**
 * @swagger
 * /todos/{id}:
 *   get:
 *     summary: Mengambil Todo berdasarkan ID
 *     tags: [Todo]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Todo
 *     responses:
 *       200:
 *         description: Todo berhasil ditemukan
 *       400:
 *         description: ID tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       404:
 *         description: Todo tidak ditemukan
 */
router.get("/:id", protect, todoIdValidator, async (req, res, next) => {
    try {
        const todo = await Todo.findOne({
            _id: req.params.id,
            user: req.user._id
        })
            .populate("user", "name email")
            .populate("category", "name");

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: "Todo tidak ditemukan."
            });
        }

        res.status(200).json({
            success: true,
            data: todo
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// POST /todos
// Membuat Todo baru
// ==========================================
/**
 * @swagger
 * /todos:
 *   post:
 *     summary: Membuat Todo baru
 *     tags: [Todo]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Belajar Backend
 *               description:
 *                 type: string
 *                 example: Mempelajari Express dan MongoDB
 *               completed:
 *                 type: boolean
 *                 example: false
 *               category:
 *                 type: string
 *                 nullable: true
 *                 example: 65a123456789abcdef123456
 *     responses:
 *       201:
 *         description: Todo berhasil dibuat
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Token tidak valid
 */
router.post(
    "/",
    protect,
    todoValidator,
    async (req, res, next) => {
        try {
            const todo = await Todo.create({
                title: req.body.title,
                description: req.body.description || "",
                completed: req.body.completed ?? false,
                user: req.user._id,
                category: req.body.category || null
            });

            await ActivityLog.create({
    user: req.user._id,
    action: "CREATE",
    description: "Membuat Todo baru",
    todo: todo._id
});

            res.status(201).json({
                success: true,
                message: "Todo berhasil dibuat.",
                data: todo
            });
        } catch (error) {
            next(error);
        }
    }
);

// ==========================================
// PUT /todos/:id
// Memperbarui Todo milik pengguna
// ==========================================
/**
 * @swagger
 * /todos/{id}:
 *   put:
 *     summary: Memperbarui Todo
 *     tags: [Todo]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Todo yang akan diperbarui
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Todo Baru
 *               description:
 *                 type: string
 *                 example: Deskripsi Todo yang diperbarui
 *               completed:
 *                 type: boolean
 *                 example: true
 *               category:
 *                 type: string
 *                 nullable: true
 *                 example: 65a123456789abcdef123456
 *     responses:
 *       200:
 *         description: Todo berhasil diperbarui
 *       400:
 *         description: Data atau ID tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       404:
 *         description: Todo tidak ditemukan
 */
router.put(
    "/:id",
    protect,
    todoIdValidator,
    todoValidator,
    async (req, res, next) => {
        try {
            const updateData = {};

            // Hanya izinkan kolom berikut diperbarui
            const allowedFields = [
                "title",
                "description",
                "completed",
                "category"
            ];

            for (const field of allowedFields) {
                if (req.body[field] !== undefined) {
                    updateData[field] = req.body[field];
                }
            }

            // Konversi kategori kosong menjadi null
            if (updateData.category === "") {
                updateData.category = null;
            }

            const todo = await Todo.findOneAndUpdate(
                {
                    _id: req.params.id,
                    user: req.user._id
                },
                updateData,
                {
                    new: true,
                    runValidators: true
                }
            )
                .populate("user", "name email")
                .populate("category", "name");

            if (!todo) {
                return res.status(404).json({
                    success: false,
                    message: "Todo tidak ditemukan."
                });
            }
            await ActivityLog.create({
    user: req.user._id,
    action: "UPDATE",
    description: "Memperbarui Todo",
    todo: todo._id
});
            res.status(200).json({
                success: true,
                message: "Todo berhasil diperbarui.",
                data: todo
            });
        } catch (error) {
            next(error);
        }
    }
);

// ==========================================
// DELETE /todos/:id
// Menghapus Todo milik pengguna
// ==========================================
/**
 * @swagger
 * /todos/{id}:
 *   delete:
 *     summary: Menghapus Todo
 *     tags: [Todo]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Todo yang akan dihapus
 *     responses:
 *       200:
 *         description: Todo berhasil dihapus
 *       400:
 *         description: ID tidak valid
 *       401:
 *         description: Tidak terautentikasi
 *       404:
 *         description: Todo tidak ditemukan
 */
router.delete(
    "/:id",
    protect,
    todoIdValidator,
    async (req, res, next) => {
        try {
            const todo = await Todo.findOneAndDelete({
                _id: req.params.id,
                user: req.user._id
            });

            if (!todo) {
                return res.status(404).json({
                    success: false,
                    message: "Todo tidak ditemukan."
                });
            }
            await ActivityLog.create({
    user: req.user._id,
    action: "DELETE",
    description: "Menghapus Todo",
    todo: todo._id
});
            res.status(200).json({
                success: true,
                message: "Todo berhasil dihapus."
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;