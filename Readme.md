# Todo API

RESTful API untuk aplikasi manajemen tugas (Todo List) yang dibangun menggunakan Node.js, Express.js, dan MongoDB. API ini menyediakan fitur autentikasi pengguna, pengelolaan Todo dan Category, validasi input, pencatatan aktivitas, serta statistik data.

## Fitur Utama

- **Authentication** — Registrasi dan login pengguna menggunakan JWT.
- **Authorization** — Pembatasan akses endpoint berdasarkan autentikasi dan role pengguna.
- **Todo Management** — Membuat, membaca, memperbarui, dan menghapus Todo.
- **Category Management** — Mengelola kategori Todo.
- **Input Validation** — Validasi data menggunakan Express Validator.
- **Filtering** — Memfilter Todo berdasarkan status selesai dan kategori.
- **Search** — Mencari Todo berdasarkan judul.
- **Sorting** — Mengurutkan data Todo.
- **Pagination** — Membagi hasil data ke dalam beberapa halaman.
- **Activity Log** — Mencatat aktivitas pengguna ketika membuat, memperbarui, dan menghapus Todo.
- **Statistics** — Menampilkan ringkasan statistik Todo dan Category menggunakan API Key.
- **API Documentation** — Dokumentasi API menggunakan Swagger.
- **Automated Testing** — Pengujian API menggunakan Jest dan Supertest.

## Teknologi yang Digunakan

| Teknologi | Kegunaan |
|---|---|
| Node.js | Runtime JavaScript |
| Express.js | Framework backend |
| MongoDB | Database NoSQL |
| Mongoose | ODM untuk MongoDB |
| JSON Web Token (JWT) | Autentikasi pengguna |
| bcrypt | Enkripsi/hash password |
| express-validator | Validasi input |
| dotenv | Pengelolaan environment variable |
| Swagger | Dokumentasi API |
| Jest | Automated testing |
| Supertest | Pengujian HTTP endpoint |
| MongoDB Memory Server | Database sementara untuk pengujian |

## Struktur Folder

```text
Web Beckend/
│
├── config/
│   ├── db.js
│   └── swagger.js
│
├── controllers/
│   ├── todoController.js
│   └── Controllercategory.js
│
├── docs/
│   └── api-endpoint.md
│
├── middleware/
│   ├── activityLogger.js
│   ├── apiKeyAuth.js
│   ├── errorHandler.js
│   ├── logger.js
│   ├── notFound.js
│   ├── protect.js
│   ├── restrictTo.js
│   ├── validateRequest.js
│   └── validateTodo.js
│
├── models/
│   ├── ActivityLog.js
│   ├── Category.js
│   ├── Todo.js
│   └── user.js
│
├── postman/
│   ├── collections/
│   ├── environments/
│   └── globals/
│
├── ruotes/
│   ├── activityLogRoutes.js
│   ├── categoryRoutes.js
│   ├── statsRoutes.js
│   └── todoRoutes.js
│
├── tests/
│   └── todo.test.js
│
├── utils/
│   ├── AppError.js
│   └── CatchAsynch.js
│
├── validator/
│   ├── authValidator.js
│   ├── categoryValidator.js
│   └── todoValidator.js
│
├── .env
├── .gitignore
├── app.js
├── index.js
├── package.json
└── README.md
```

## Persyaratan

Sebelum menjalankan proyek, pastikan perangkat sudah memiliki:

- Node.js dan npm.
- MongoDB Atlas atau MongoDB lokal.
- Git (opsional).
- Visual Studio Code (opsional).

## Instalasi

1. Clone repository:

```bash
git clone <URL_REPOSITORY>
```

2. Masuk ke direktori proyek:

```bash
cd "Web Beckend"
```

3. Install dependencies:

```bash
npm install
```

4. Buat file `.env` di direktori utama proyek.

## Environment Variables

Isi file `.env` dengan konfigurasi berikut:

```env
PORT=3000

MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>

JWT_SECRET=<secret_key>
JWT_EXPIRES_IN=1d

API_KEY=<api_key>
```

Keterangan:

| Variabel | Fungsi |
|---|---|
| PORT | Port untuk menjalankan server |
| MONGO_URI | URI koneksi MongoDB |
| JWT_SECRET | Secret key untuk verifikasi JWT |
| JWT_EXPIRES_IN | Masa berlaku token JWT |
| API_KEY | Kunci akses endpoint statistik |

**Catatan keamanan:** Jangan membagikan file `.env` atau memasukkannya ke repository publik. Gunakan `.env.example` tanpa nilai kredensial jika ingin membagikan contoh konfigurasi.

## Menjalankan Aplikasi

Jalankan server menggunakan perintah:

```bash
node index.js
```

Jika berhasil, server akan berjalan pada:

```text
http://localhost:3000
```

Dokumentasi Swagger dapat diakses melalui:

```text
http://localhost:3000/api-docs
```

## API Endpoints

Base URL:

```text
http://localhost:3000
```

### 1. Authentication

| Method | Endpoint | Keterangan |
|---|---|---|
| POST | `/register` | Registrasi pengguna |
| POST | `/login` | Login pengguna |
| GET | `/profile` | Melihat profil pengguna |

Endpoint autentikasi menyesuaikan prefix route yang digunakan pada `app.js`.

### 2. Todo

| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| GET | `/todos` | Mengambil seluruh Todo | User |
| GET | `/todos/:id` | Mengambil Todo berdasarkan ID | User |
| POST | `/todos` | Membuat Todo baru | User |
| PUT | `/todos/:id` | Memperbarui Todo | User |
| DELETE | `/todos/:id` | Menghapus Todo | User |

Fitur tambahan pada endpoint list Todo:

- Filtering berdasarkan status selesai.
- Filtering berdasarkan kategori.
- Pencarian berdasarkan judul.
- Sorting berdasarkan field tertentu.
- Pagination menggunakan page dan limit.

### 3. Category

| Method | Endpoint | Keterangan | Akses |
|---|---|---|---|
| GET | `/categories` | Mengambil seluruh kategori | User |
| GET | `/categories/:id` | Mengambil kategori berdasarkan ID | User |
| POST | `/categories` | Membuat kategori | User |
| PATCH | `/categories/:id` | Memperbarui kategori | User |
| DELETE | `/categories/:id` | Menghapus kategori | User |

### 4. Activity Log

Activity Log digunakan untuk mencatat aktivitas pengguna pada data Todo.

Aktivitas yang dicatat:

- Create Todo.
- Update Todo.
- Delete Todo.

Endpoint mengikuti konfigurasi route Activity Log pada aplikasi.

### 5. Statistics

| Method | Endpoint | Keterangan |
|---|---|---|
| GET | `/api/stats` | Mengambil ringkasan statistik aplikasi |

Endpoint statistik menggunakan API Key untuk autentikasi machine-to-machine.

Header yang digunakan:

```http
x-api-key: <API_KEY>
```

Contoh informasi statistik:

- Total Todo.
- Todo selesai.
- Todo belum selesai.
- Total Category.
- Total User.

## Authentication

Endpoint yang membutuhkan autentikasi menggunakan JWT dengan format:

```http
Authorization: Bearer <token>
```

Token diperoleh setelah pengguna berhasil melakukan login.

## Testing API

Pengujian endpoint dapat dilakukan menggunakan Postman.

Langkah pengujian:

1. Jalankan server menggunakan `node index.js`.
2. Buka Postman.
3. Import collection Todo API Testing.
4. Import environment Todo API Environment.
5. Lakukan registrasi dan login.
6. Simpan token JWT ke environment.
7. Uji endpoint Todo dan Category.
8. Uji Activity Log dan Statistics.

## Automated Testing

Proyek menyediakan pengujian otomatis menggunakan Jest dan Supertest.

Jalankan pengujian dengan:

```bash
npx jest
```

## Error Handling

API menggunakan HTTP status code untuk memberikan informasi hasil permintaan.

| Status Code | Keterangan |
|---|---|
| 200 | Request berhasil |
| 201 | Data berhasil dibuat |
| 400 | Request atau input tidak valid |
| 401 | Belum terautentikasi |
| 403 | Tidak memiliki izin akses |
| 404 | Data atau endpoint tidak ditemukan |
| 500 | Internal server error |

## Keamanan

Beberapa mekanisme keamanan yang diterapkan:

- Password disimpan dalam bentuk hash menggunakan bcrypt.
- Autentikasi menggunakan JSON Web Token.
- Pembatasan akses menggunakan middleware.
- Validasi input pada endpoint.
- API Key untuk endpoint statistik.
- Environment variable untuk menyimpan konfigurasi sensitif.
- File `.env` dan folder `node_modules` dikecualikan melalui `.gitignore`.

## License

Proyek ini dibuat untuk keperluan pembelajaran dan pengembangan aplikasi backend menggunakan Node.js, Express.js, dan MongoDB.