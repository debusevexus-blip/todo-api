// Mengambil konfigurasi dotenv
require("dotenv").config();

// Mengambil aplikasi dari app.js
const app = require("./app");

// Mengambil koneksi database
const connectDB = require("./config/db");

// Menentukan port server
const PORT = process.env.PORT || 3000;

// Menghubungkan MongoDB
connectDB();

// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});