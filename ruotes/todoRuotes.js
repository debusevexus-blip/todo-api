const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const protect = require("../middleware/protect");
const Todo = require("../models/Todo");
const ActivityLog = require("../models/ActivityLog");

const {
    todoValidator,
    todoUpdateValidator,
    todoIdValidator
} = require("../validator/todoValidator");

// ==========================================
// SWAGGER DOCUMENTATION
// ==========================================

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
 *     tags: [Todo]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Berhasil mengambil daftar Todo
 *       400:
 *         description: Parameter tidak valid
 *       401:
 *         description: Token tidak valid
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
 *                 example: Belajar Express dan MongoDB
 *               completed:
 *                 type: boolean
 *                 example: false
 *               category:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Todo berhasil dibuat
 *       400:
 *         description: Validasi gagal
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
 *     responses:
 *       200:
 *         description: Todo ditemukan
 *       404:
 *         description: Todo tidak ditemukan
 *
 *   put:
 *     summary: Memperbarui Todo berdasarkan ID
 *     description: Mendukung partial update, sehingga tidak semua field wajib dikirim.
 *     tags: [Todo]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               completed:
 *                 type: boolean
 *               category:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Todo berhasil diperbarui
 *       400:
 *         description: Data tidak valid
 *       404:
 *         description: Todo tidak ditemukan
 *
 *   delete:
 *     summary: Mengarsipkan Todo
 *     tags: [Todo]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Todo berhasil diarsipkan
 *       404:
 *         description: Todo tidak ditemukan
 */

// ==========================================
// GET ALL TODO
// FILTERING, SEARCH, SORTING, PAGINATION
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

        // PAGINATION VALIDATION
        const pageRaw = req.query.page;
        const limitRaw = req.query.limit;

        const page = pageRaw === undefined ? 1 : Number(pageRaw);
        const limit = limitRaw === undefined ? 10 : Number(limitRaw);

        if (
            !Number.isInteger(page) ||
            page < 1 ||
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "Page minimal 1 dan limit harus antara 1 sampai 100."
            });
        }

        const skip = (page - 1) * limit;

        // SORTING
     // ======================================
// SORTING
// ======================================

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

if (
    req.query.order !== undefined &&
    !["asc", "desc"].includes(req.query.order)
) {
    return res.status(400).json({
        success: false,
        message: "Order harus asc atau desc."
    });
}

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

        // VALIDASI CATEGORY
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
// UPDATE TODO (PARTIAL UPDATE)
// ==========================================

router.put(
    "/:id",
    protect,
    todoIdValidator,
    todoUpdateValidator,
    async (req, res, next) => {
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

            // FIELD YANG BOLEH DIUPDATE
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

            // VALIDASI CATEGORY
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
    }
);

// ==========================================
// DELETE TODO (SOFT DELETE)
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