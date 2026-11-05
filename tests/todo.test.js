const express = require("express");

jest.setTimeout(3000);

const request = require("supertest");
const mongoose = require("mongoose");
const os = require("os");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");

const User = require("../models/user");
const Todo = require("../models/Todo");


const path = require("path");

require("dotenv").config({
    path: path.resolve(__dirname, "../.env"),
    quiet: true
});

console.log("JWT_SECRET tersedia:", Boolean(process.env.JWT_SECRET));
const app = require("../app");

let mongoServer;
let token;
let userId;

// ==========================================
// PERSIAPAN DATABASE
// ==========================================

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri(), {
        runtimeAdapters: {
            os: os
        }
    });
}, 120000);

// ==========================================
// MEMBUAT USER DAN TOKEN
// ==========================================

beforeEach(async () => {
    await User.deleteMany({});
    await Todo.deleteMany({});

    const user = await User.create({
        name: "Pengguna Test",
        email: `test${Date.now()}@gmail.com`,
        password: "password123"
    });

    userId = user._id;

    token = jwt.sign(
        { id: userId.toString() },
        process.env.JWT_SECRET || "9804jeujduje",
        { expiresIn: "1d" }
    );
});

// ==========================================
// AUTOMATED TEST TODO API
// ==========================================

describe("Pengujian Todo API", () => {

    // TEST 1: GET TODO

    test("Berhasil mengambil daftar Todo", async () => {
        await Todo.create({
            title: "Belajar Jest",
            description: "Pengujian API",
            completed: false,
            user: userId
        });

        const response = await request(app)
            .get("/todos")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(1);
    });

    // TEST 2: CREATE TODO

    test("Berhasil membuat Todo", async () => {
        const response = await request(app)
            .post("/todos")
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Belajar Automated Testing",
                description: "Menggunakan Jest dan Supertest",
                completed: false
            });
       console.log("HASIL CREATE:", JSON.stringify(response.body, null, 2));
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.title)
            .toBe("Belajar Automated Testing");

        const todo = await Todo.findById(
            response.body.data._id
        );

        expect(todo).not.toBeNull();
    });

    // TEST 3: UPDATE TODO

    test("Berhasil memperbarui Todo", async () => {
        const todo = await Todo.create({
            title: "Todo Lama",
            description: "Deskripsi lama",
            completed: false,
            user: userId
        });

        const response = await request(app)
            .put(`/todos/${todo._id}`)
            .set("Authorization", `Bearer ${token}`)
            .send({
                title: "Todo Baru",
                description: "Deskripsi baru",
                completed: true
            });
        console.log("HASIL UPDATE:", JSON.stringify(response.body, null, 2));
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe("Todo Baru");
    });

    // TEST 4: DELETE TODO

    test("Berhasil menghapus Todo", async () => {
        const todo = await Todo.create({
            title: "Todo Hapus",
            description: "Pengujian penghapusan",
            completed: false,
            user: userId
        });

        const response = await request(app)
            .delete(`/todos/${todo._id}`)
            .set("Authorization", `Bearer ${token}`);
        
        console.log("HASIL DELETE:", JSON.stringify(response.body, null, 2));
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        const deletedTodo = await Todo.findById(todo._id);

        expect(deletedTodo).toBeNull();
    });

    // TEST 5: TANPA TOKEN

    test("Menolak akses tanpa token", async () => {
        const response = await request(app)
            .get("/todos");

        expect(response.status).toBe(401);
    });

    // TEST 6: ID TIDAK VALID

    test("Menolak ID Todo yang tidak valid", async () => {
        const response = await request(app)
            .get("/todos/id-tidak-valid")
            .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(400);
    });

});

// ==========================================
// MENUTUP DATABASE
// ==========================================

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase();
        await mongoose.disconnect();
    }

    if (mongoServer) {
        await mongoServer.stop();
    }
});