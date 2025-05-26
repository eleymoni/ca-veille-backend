const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const CategoryModel = require("../models/categories.model");

jest.mock("../middlewares/auth.middleware", () => {
    return (req, res, next) => {
        req.id = "user123";
        next();
    };
});

jest.mock("../models/categories.model", () => ({
    findOne: jest.fn().mockResolvedValue(null),
    findById: jest.fn().mockImplementation((id) =>
        Promise.resolve(
            id === "cartegory123"
                ? {
                      _id: "cartegory123",
                      name: "Old name",
                      color: "#ffffff",
                      ownerId: "user123",
                      feeds: [],
                  }
                : null
        )
    ),
    findByIdAndUpdate: jest.fn().mockResolvedValue(true),
    create: jest.fn().mockResolvedValue({
        _id: "cartegory123",
        name: "Old name",
        color: "#ffffff",
        ownerId: "user123",
        feeds: [],
    }),
}));

describe("PUT /categories/name", () => {
    it("devrait mettre à jour le nom de la catégorie", async () => {
        const res = await request(app).put("/categories/name").send({
            categoryId: "cartegory123",
            name: "New name",
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.result).toBe(true);
    });

    it("Should return 400 if missing or empty fields", async () => {
        const res = await request(app).put("/categories/name").send({
            categoryId: "cartegory123",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.result).toBe(false);
        expect(res.body.error).toBe("Missing or empty fields");
    });

    it("Should return 404 if category not found", async () => {
        const res = await request(app).put("/categories/name").send({
            categoryId: "otherCartegory",
            name: "Other name",
        });

        expect(res.statusCode).toBe(404);
        expect(res.body.result).toBe(false);
        expect(res.body.error).toBe("Category not found");
    });

    it("Should return 409 if category already exists", async () => {
        CategoryModel.findOne.mockResolvedValueOnce({
            _id: "existingCategory",
            name: "Other name",
            ownerId: "user123",
        });

        const res = await request(app).put("/categories/name").send({
            categoryId: "cartegory123",
            name: "Other name",
        });

        expect(res.statusCode).toBe(409);
        expect(res.body.result).toBe(false);
        expect(res.body.error).toBe("Category already exists");
    });

    it("Should return 401 if not authorized", async () => {
        CategoryModel.findById.mockResolvedValueOnce({
            _id: "cartegory123",
            name: "Old name",
            color: "#ffffff",
            ownerId: "user321",
            feeds: [],
        });
        const res = await request(app).put("/categories/name").send({
            categoryId: "cartegory123",
            name: "New name",
        });

        expect(res.statusCode).toBe(401);
        expect(res.body.result).toBe(false);
        expect(res.body.error).toBe("Not authorized");
    });
});

afterAll(async () => {
    await mongoose.disconnect();
});
