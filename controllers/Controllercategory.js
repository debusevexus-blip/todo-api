const Category = require("../models/Category");

// CREATE CATEGORY
const createCategory = async (req, res, next) => {
    try {
        const category = await Category.create;
        res.status(201).json({
            success: true,
            message: "Category berhasil dibuat",
            data: category
        });
    } catch (error) {
        next(error);
    }
};

// GET ALL CATEGORY + FILTERING, SEARCH, SORTING, PAGINATION
const getCategories = async (req, res, next) => {
    try {
        const {
            name,
            search,
            sort = "latest",
            page = 1,
            limit = 10
        } = req.query;

        // FILTERING
        const filter = {};

        if (name) {
            filter.name = {
                $regex: name,
                $options: "i"
            };
        }

        // SEARCH
        if (search) {
            filter.name = {
                $regex: search,
                $options: "i"
            };
        }

        // SORTING
        const sortOptions = {
            latest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            name_asc: { name: 1 },
            name_desc: { name: -1 }
        };

        if (!sortOptions[sort]) {
            return res.status(400).json({
                success: false,
                message: "Pilihan sorting tidak valid"
            });
        }

        // PAGINATION
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (
            !Number.isInteger(pageNumber) ||
            !Number.isInteger(limitNumber) ||
            pageNumber < 1 ||
            limitNumber < 1 ||
            limitNumber > 100
        ) {
            return res.status(400).json({
                success: false,
                message: "page minimal 1 dan limit harus 1-100"
            });
        }

        const skip = (pageNumber - 1) * limitNumber;

        const [categories, total] = await Promise.all([
            Category.find(filter)
                .sort(sortOptions[sort])
                .skip(skip)
                .limit(limitNumber),
            Category.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            total,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber),
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

// GET CATEGORY BY ID
const getCategoryById = async (req, res, next) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category tidak ditemukan"
            });
        }

        res.status(200).json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

// UPDATE CATEGORY
const updateCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category tidak ditemukan"
            });
        }

        res.status(200).json({
            success: true,
            message: "Category berhasil diperbarui",
            data: category
        });
    } catch (error) {
        next(error);
    }
};

// DELETE CATEGORY
const deleteCategory = async (req, res, next) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category tidak ditemukan"
            });
        }

        res.status(200).json({
            success: true,
            message: "Category berhasil dihapus"
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};