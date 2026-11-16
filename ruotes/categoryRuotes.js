/**
 * @swagger
 * tags:
 *   name: Category
 *   description: API untuk mengelola kategori Todo
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Mengambil seluruh kategori pengguna
 *     tags: [Category]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mengambil seluruh kategori
 *       401:
 *         description: Token tidak valid
 *
 *   post:
 *     summary: Membuat kategori baru
 *     tags: [Category]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pendidikan
 *               description:
 *                 type: string
 *                 example: Kategori untuk kegiatan belajar
 *     responses:
 *       201:
 *         description: Category berhasil dibuat
 *       400:
 *         description: Data tidak valid
 *       401:
 *         description: Token tidak valid
 *       409:
 *         description: Nama kategori sudah digunakan
 */

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Mengambil kategori berdasarkan ID
 *     tags: [Category]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID kategori
 *     responses:
 *       200:
 *         description: Berhasil mengambil kategori
 *       400:
 *         description: ID kategori tidak valid
 *       404:
 *         description: Kategori tidak ditemukan
 *
 *   put:
 *     summary: Memperbarui kategori berdasarkan ID
 *     tags: [Category]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID kategori
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Pendidikan
 *               description:
 *                 type: string
 *                 example: Kategori belajar dan latihan
 *     responses:
 *       200:
 *         description: Kategori berhasil diperbarui
 *       400:
 *         description: Data atau ID tidak valid
 *       404:
 *         description: Kategori tidak ditemukan
 *
 *   delete:
 *     summary: Mengarsipkan kategori berdasarkan ID
 *     tags: [Category]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID kategori
 *     responses:
 *       200:
 *         description: Kategori berhasil diarsipkan
 *       404:
 *         description: Kategori tidak ditemukan
 */


const express = require("express");
const router = express.Router();

const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require("../controllers/Controllercategory");

const {
    categoryValidator,
    categoryIdValidator
} = require("../validator/categoryValidator");

const protect = require("../middleware/protect");

router.use(protect);

router.post("/", categoryValidator, createCategory);

router.get("/", getCategories);

router.get("/:id", categoryIdValidator, getCategoryById);

router.put("/:id", categoryIdValidator, categoryValidator, updateCategory);

router.delete("/:id", categoryIdValidator, deleteCategory);

module.exports = router;