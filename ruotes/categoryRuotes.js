const express = require("express");
const router = express.Router();

const {
    categoryValidator,
    categoryIdValidator
} = require("../validator/categoryValidator");

const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require("../controllers/Controllercategory");

const protect = require("../middleware/protect");

router.use(protect);

// CREATE
router.post("/", categoryValidator, createCategory);

// READ
router.get("/", getCategories);
router.get("/:id", categoryIdValidator, getCategoryById);

// UPDATE
router.patch("/:id", categoryIdValidator, categoryValidator, updateCategory);

// DELETE
router.delete("/:id", categoryIdValidator, deleteCategory);

module.exports = router;