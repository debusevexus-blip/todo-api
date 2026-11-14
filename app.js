const express = require("express");
const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// Middleware
const logger = require("./middleware/logger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const protect = require("./middleware/protect");
const restrictTo = require("./middleware/restrictTo");

// Route Activity Log
const activityLogRoutes = require("./ruotes/activityLogRoutes");

// Custom error dan catchAsync
const AppError = require("./utils/AppError");
const catchAsync = require("./utils/CatchAsynch");

// Models
const User = require("./models/user");
const Todo = require("./models/Todo");
const Category = require("./models/Category");

// Library
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Validator Register dan Login
const {
    registerValidator,
    loginValidator
} = require("./validator/authValidator");

// Routes Todo dan Category
const todoRoutes = require("./ruotes/todoRuotes");
const categoryRoutes = require("./ruotes/categoryRuotes");
const statsRoutes = require("./ruotes/statsRuotes");

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());
app.use(logger);

// ==========================================
// ENDPOINT UTAMA
// ==========================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "API Todo berjalan"
    });
});

// ==========================================
// MENGUJI APPERROR DAN CATCHASYNC
// ==========================================

app.get(
    "/api/todo/:id",
    catchAsync(async (req, res) => {
        const todo = null;

        if (!todo) {
            throw new AppError("Todo tidak ditemukan", 404);
        }

        res.status(200).json({
            success: true,
            data: todo
        });
    })
);

// ==========================================
// MENGUJI ERROR HANDLER
// ==========================================

app.get("/error", (req, res, next) => {
    next(new Error("Contoh kesalahan server"));
});

// ==========================================
// ENDPOINT PENGUJIAN USER
// ==========================================

app.post("/user", async (req, res, next) => {
    try {
        const user = await User.create({
            name: "ujang",
            email: `ujang${Date.now()}@gmail.com`,
            password: "ujang780"
        });

        res.status(201).json({
            success: true,
            message: "User berhasil disimpan",
            data: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// MENGUJI RELASI USER, CATEGORY, TODO
// ==========================================

app.get("/test-models", async (req, res, next) => {
    try {
        const user = await User.create({
            name: "juned",
            email: `juned${Date.now()}@gmail.com`,
            password: "password123"
        });

        const category = await Category.create({
            name: "Pendidikan",
            description: "Kategori belajar",
            user: user._id
        });

        const todo = await Todo.create({
            title: "Belajar Backend",
            description: "Mempelajari Mongoose",
            user: user._id,
            category: category._id
        });

        const hasil = await Todo.findById(todo._id)
            .populate("user")
            .populate("category");

        res.status(200).json({
            success: true,
            message: "Pengujian relasi berhasil",
            data: hasil
        });
    } catch (error) {
        next(error);
    }
});

// ==========================================
// ENDPOINT PENGUJIAN SEDERHANA
// ==========================================

app.get("/cek", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Endpoint berhasil dijalankan!"
    });
});

// ==========================================
// REGISTER
// ==========================================

app.post("/register", registerValidator, async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const emailNormalized = email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: emailNormalized
        });

        if (existingUser) {
            return res.status(422).json({
                success: false,
                message: "Email sudah terdaftar"
            });
        }

        const user = await User.create({
            name: name.trim(),
            email: emailNormalized,
            password
        });

        res.status(201).json({
            success: true,
            message: "Register berhasil",
            data: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        next(error);
    }
});

// ==========================================
// LOGIN
// ==========================================

app.post("/login", loginValidator, async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                success: false,
                message: "Konfigurasi JWT_SECRET belum tersedia"
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        }).select("+password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email atau password salah"
            });
        }

        const passwordCocok = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordCocok) {
            return res.status(401).json({
                success: false,
                message: "Email atau password salah"
            });
        }

        const token = jwt.sign(
            {
                id: user._id.toString()
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        res.status(200).json({
            success: true,
            message: "Login berhasil",
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        next(error);
    }
});

// ==========================================
// PROFILE
// ==========================================

app.get("/profile", protect, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Autentikasi berhasil",
        user: req.user
    });
});

// ==========================================
// ENDPOINT ADMIN
// ==========================================

app.get("/admin", protect, restrictTo("admin"), (req, res) => {
    res.status(200).json({
        success: true,
        message: "Selamat datang, Admin!"
    });
});

// ==========================================
// ROUTE TODO
// ==========================================

app.use("/todos", todoRoutes);

// ==========================================
// ROUTE CATEGORY
// ==========================================

app.use("/categories", categoryRoutes);

// ==========================================
// ROUTE STATISTIK
// ==========================================

app.use("/api/stats", statsRoutes);

// ==========================================
// ROUTE ACTIVITY LOG
// ==========================================

app.use("/api/activity-logs", activityLogRoutes);


// Dokumentasi Swagger
// Dokumentasi Swagger
const swaggerOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "API Documentation",
  customJs: [
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js"
  ],
  customCssUrl: [
    "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css"
  ]
};

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerOptions)
);
// ==========================================
// NOT FOUND DAN ERROR HANDLER
// ==========================================

app.use(notFound);
app.use(errorHandler);

// ==========================================
// EXPORT APP
// ==========================================

module.exports = app;