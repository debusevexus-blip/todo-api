// Handler untuk Vercel
const handler = async (req, res) => {
    // Swagger tidak membutuhkan koneksi MongoDB
    if (req.url.startsWith("/api-docs")) {
        return app(req, res);
    }

    // Endpoint API membutuhkan koneksi MongoDB
    await connectDB();

    return app(req, res);
};