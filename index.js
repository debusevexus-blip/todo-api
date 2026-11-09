require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 3000;

// Handler untuk Vercel
const handler = async (req, res) => {
    await connectDB();
    return app(req, res);
};

// Menjalankan secara lokal
if (require.main === module) {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`Server berjalan di port ${PORT}`);
        });
    });
}

// Export untuk Vercel
module.exports = handler;