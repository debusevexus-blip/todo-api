const Todo = require("../models/Todo");

const getTodos = async (req, res) => {
    try {
        const {
            search,
            completed,
            category,
            sort = "latest",
            page = 1,
            limit = 10
        } = req.query;

        // 1. FILTERING
        const filter = {};

        // Filter berdasarkan status selesai
        if (completed !== undefined) {
            if (!["true", "false"].includes(completed)) {
                return res.status(400).json({
                    success: false,
                    message: "completed harus true atau false"
                });
            }

            filter.completed = completed === "true";
        }

        // Filter berdasarkan kategori
        if (category) {
            filter.category = category;
        }

        // 2. SEARCH
        if (search) {
            filter.title = {
                $regex: search,
                $options: "i"
            };
        }

        // 3. SORTING
        const sortOptions = {
            latest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            title_asc: { title: 1 },
            title_desc: { title: -1 }
        };

        if (!sortOptions[sort]) {
            return res.status(400).json({
                success: false,
                message: "Pilihan sorting tidak valid"
            });
        }

        // 4. PAGINATION
        const currentPage = Math.max(1, parseInt(page, 10) || 1);
        const perPage = Math.min(
            100,
            Math.max(1, parseInt(limit, 10) || 10)
        );

        const skip = (currentPage - 1) * perPage;

        // Menghitung total data
        const total = await Todo.countDocuments(filter);

        // Mengambil data sesuai filter dan pagination
        const todos = await Todo.find(filter)
            .sort(sortOptions[sort])
            .skip(skip)
            .limit(perPage);

        res.status(200).json({
            success: true,
            total,
            page: currentPage,
            limit: perPage,
            totalPages: Math.ceil(total / perPage),
            data: todos
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Gagal mengambil data Todo",
            error: error.message
        });
    }
};

module.exports = { getTodos };
