/**
 * @swagger
 * tags:
 *   name: Todo
 *   description: API untuk mengelola Todo pengguna
 */

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: Mengambil seluruh Todo pengguna
 *     description: Menampilkan Todo dengan filtering, search, sorting, dan pagination.
 *     tags: [Todo]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Mencari Todo berdasarkan judul
 *         example: Belajar
 *
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Nomor halaman
 *
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Jumlah data per halaman
 *
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, createdAt, updatedAt, completed]
 *           default: createdAt
 *         description: Field untuk sorting
 *
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Urutan data
 *
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter berdasarkan status Todo
 *
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter berdasarkan ID kategori
 *
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar Todo
 *       400:
 *         description: Parameter query tidak valid
 *       401:
 *         description: Token tidak ditemukan atau tidak valid
 *
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
 *                 example: null
 *     responses:
 *       201:
 *         description: Todo berhasil dibuat
 *       400:
 *         description: Validasi data gagal
 *       401:
 *         description: Token tidak valid
 *
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
 *         description: Berhasil mengambil Todo
 *       400:
 *         description: ID Todo tidak valid
 *       401:
 *         description: Token tidak valid
 *       404:
 *         description: Todo tidak ditemukan
 *
 *   put:
 *     summary: Memperbarui Todo berdasarkan ID
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
 *                 example: Belajar Node.js
 *               description:
 *                 type: string
 *                 example: Memperbarui materi belajar
 *               completed:
 *                 type: boolean
 *                 example: true
 *               category:
 *                 type: string
 *                 nullable: true
 *                 example: null
 *     responses:
 *       200:
 *         description: Todo berhasil diperbarui
 *       400:
 *         description: Data atau ID tidak valid
 *       401:
 *         description: Token tidak valid
 *       404:
 *         description: Todo tidak ditemukan
 *
 *   delete:
 *     summary: Mengarsipkan Todo berdasarkan ID
 *     tags: [Todo]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID Todo yang akan diarsipkan
 *     responses:
 *       200:
 *         description: Todo berhasil diarsipkan
 *       401:
 *         description: Token tidak valid
 *       404:
 *         description: Todo tidak ditemukan
 */



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
// GET ALL TODO
// Filtering, Search, Sorting, Pagination
// ==========================================

router.get("/", protect, async (req, res, next) => {
    try {
        const filter = {
            user: req.user._id,
            archived: false
        };

        // FILTERING COMPLETED
        if (req.query.completed !== undefined) {
            if (!["true", "false"].includes(req.query.completed)) {
                return res.status(400).json({
                    success: false,
                    message: "completed harus true atau false."
                });
            }

            filter.completed = req.query.completed === "true";
        }

        // FILTERING CATEGORY
        if (req.query.category) {
            if (!mongoose.isValidObjectId(req.query.category)) {
                return res.status(400).json({
                    success: false,
                    message: "ID kategori tidak valid."
                });
            }

            filter.category = req.query.category;
        }

        // SEARCH
        if (req.query.search) {
            const search = req.query.search.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.title = {
                $regex: search,
                $options: "i"
            };
        }

        // PAGINATION
        const page = Math.max(
            1,
            parseInt(req.query.page, 10) || 1
        );

        const limit = Math.min(
            100,
            Math.max(1, parseInt(req.query.limit, 10) || 10)
        );

        const skip = (page - 1) * limit;

        // SORTING
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

        // QUERY DATABASE
        const total = await Todo.countDocuments(filter);

        const todos = await Todo.find(filter)
            .sort({ [sortBy]: order })
            .skip(skip)
            .limit(limit)
            .populate("user", "name email")
            .populate("category", "name")
            .populate("created_by", "name email")
            .populate("updated_by", "name email");

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


// ==========================================
// GET /todos/:id
// GET TODO BY ID
// ==========================================

router.get("/:id", protect, todoIdValidator, async (req, res, next) => {
    try {
        const todo = await Todo.findOne({
            _id: req.params.id,
            user: req.user._id,
            archived: false
        })
            .populate("user", "name email")
            .populate("category", "name")
            .populate("created_by", "name email")
            .populate("updated_by", "name email");

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
// CREATE TODO
// ==========================================

router.post("/", protect, todoValidator, async (req, res, next) => {
    try {
        const {
            title,
            description,
            completed,
            category
        } = req.body;

        // Validasi kategori jika diberikan
        if (category) {
            if (!mongoose.isValidObjectId(category)) {
                return res.status(400).json({
                    success: false,
                    message: "ID kategori tidak valid."
                });
            }

            const categoryExists = await mongoose.model("Category").findOne({
                _id: category,
                user: req.user._id,
                archived: false
            });

            if (!categoryExists) {
                return res.status(404).json({
                    success: false,
                    message: "Category tidak ditemukan."
                });
            }
        }

        const todo = await Todo.create({
            title,
            description,
            completed: completed ?? false,
            category: category || null,
            user: req.user._id,
            created_by: req.user._id,
            updated_by: req.user._id,
            archived: false
        });

        // ACTIVITY LOG
        await ActivityLog.create({
            user: req.user._id,
            action: "CREATE",
            entity: "Todo",
            entityId: todo._id,
            description: `Membuat Todo: ${todo.title}`
        });

        const createdTodo = await Todo.findById(todo._id)
            .populate("user", "name email")
            .populate("category", "name")
            .populate("created_by", "name email")
            .populate("updated_by", "name email");

        res.status(201).json({
            success: true,
            message: "Todo berhasil dibuat.",
            data: createdTodo
        });

    } catch (error) {
        next(error);
    }
});


// ==========================================
// PUT /todos/:id
// UPDATE TODO
// ==========================================

router.put("/:id", protect, todoIdValidator, todoValidator, async (req, res, next) => {
    try {
        const todo = await Todo.findOne({
            _id: req.params.id,
            user: req.user._id,
            archived: {$ne: true}
        });

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: "Todo tidak ditemukan."
            });
        }

        // Hanya field yang diizinkan
        const allowedFields = [
            "title",
            "description",
            "completed",
            "category"
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                todo[field] = req.body[field];
            }
        }

        // Validasi kategori
        if (req.body.category) {
            if (!mongoose.isValidObjectId(req.body.category)) {
                return res.status(400).json({
                    success: false,
                    message: "ID kategori tidak valid."
                });
            }

            const categoryExists = await mongoose.model("Category").findOne({
                _id: req.body.category,
                user: req.user._id,
                archived: false
            });

            if (!categoryExists) {
                return res.status(404).json({
                    success: false,
                    message: "Category tidak ditemukan."
                });
            }
        }

        // Update audit field
        todo.updated_by = req.user._id;

        await todo.save();

        // ACTIVITY LOG
        await ActivityLog.create({
            user: req.user._id,
            action: "UPDATE",
            entity: "Todo",
            entityId: todo._id,
            description: `Memperbarui Todo: ${todo.title}`
        });

        const updatedTodo = await Todo.findById(todo._id)
            .populate("user", "name email")
            .populate("category", "name")
            .populate("created_by", "name email")
            .populate("updated_by", "name email");

        res.status(200).json({
            success: true,
            message: "Todo berhasil diperbarui.",
            data: updatedTodo
        });

    } catch (error) {
        next(error);
    }
});


// ==========================================
// DELETE /todos/:id
// SOFT DELETE TODO
// ==========================================

router.delete("/:id", protect, todoIdValidator, async (req, res, next) => {
    try {
        const todo = await Todo.findOne({
            _id: req.params.id,
            user: req.user._id,
            archived: false
        });

        if (!todo) {
            return res.status(404).json({
                success: false,
                message: "Todo tidak ditemukan."
            });
        }

        todo.archived = true;
        todo.updated_by = req.user._id;

        await todo.save();

        // ACTIVITY LOG
        await ActivityLog.create({
            user: req.user._id,
            action: "DELETE",
            entity: "Todo",
            entityId: todo._id,
            description: `Mengarsipkan Todo: ${todo.title}`
        });

        res.status(200).json({
            success: true,
            message: "Todo berhasil diarsipkan.",
            data: todo
        });

    } catch (error) {
        next(error);
    }
});


module.exports = router;
