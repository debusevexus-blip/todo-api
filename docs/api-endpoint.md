# Rancangan Endpoint API Todo List

## 1. Auth

Digunakan untuk mengatur akun pengguna.

| Endpoint             | Method | Fungsi                 | Akses       |
| -------------------- | ------ | ---------------------- | ----------- |
| `/api/auth/register` | POST   | Membuat akun baru      | Publik      |
| `/api/auth/login`    | POST   | Login                  | Publik      |
| `/api/auth/me`       | GET    | Melihat profil sendiri | Harus login |

## 2. Todo

Digunakan untuk mengelola daftar tugas.

| Endpoint                  | Method | Fungsi                   | Akses         |
| ------------------------- | ------ | ------------------------ | ------------- |
| `/api/todos`              | GET    | Menampilkan daftar tugas | Harus login   |
| `/api/todos`              | POST   | Membuat tugas            | Harus login   |
| `/api/todos/:id`          | GET    | Melihat detail tugas     | Pemilik tugas |
| `/api/todos/:id`          | PUT    | Mengubah tugas           | Pemilik tugas |
| `/api/todos/:id`          | DELETE | Menghapus tugas          | Pemilik tugas |
| `/api/todos/:id/complete` | PATCH  | Mengubah status tugas    | Pemilik tugas |

## 3. Category

Digunakan untuk mengelompokkan tugas.

| Endpoint              | Method | Fungsi                  | Akses            |
| --------------------- | ------ | ----------------------- | ---------------- |
| `/api/categories`     | GET    | Menampilkan kategori    | Harus login      |
| `/api/categories`     | POST   | Membuat kategori        | Harus login      |
| `/api/categories/:id` | GET    | Melihat detail kategori | Pemilik kategori |
| `/api/categories/:id` | PUT    | Mengubah kategori       | Pemilik kategori |
| `/api/categories/:id` | DELETE | Menghapus kategori      | Pemilik kategori |

## 4. Activity Log

Digunakan untuk mencatat aktivitas pengguna.

| Endpoint                 | Method | Fungsi                    | Akses             |
| ------------------------ | ------ | ------------------------- | ----------------- |
| `/api/activity-logs`     | GET    | Melihat riwayat aktivitas | Harus login       |
| `/api/activity-logs/:id` | GET    | Melihat detail aktivitas  | Pemilik aktivitas |

## 5. Stats

Digunakan untuk melihat statistik tugas.

| Endpoint     | Method | Fungsi                                                               | Akses       |
| ------------ | ------ | -------------------------------------------------------------------- | ----------- |
| `/api/stats` | GET    | Melihat jumlah seluruh tugas, tugas selesai, dan tugas belum selesai | Harus login |
