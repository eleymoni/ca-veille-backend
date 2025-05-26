const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const CategoryModel = require("../models/categories.model");

jest.mock("../middlewares/auth.middleware", () => (req, res, next) => {
    req.id = "user123";
    next();
});

jest.mock("../models/categories.model", () => ({
    findOne: jest.fn().mockResolvedValue(null),
    findById: jest.fn().mockImplementation((id) =>
        id === "category123"
            ? {
                  _id: "category123",
                  name: "Old name",
                  color: "#ffffff",
                  ownerId: "user123",
                  feeds: [],
              }
            : null
    ),
    findByIdAndUpdate: jest.fn().mockResolvedValue(true),
    create: jest.fn().mockResolvedValue({
        _id: "category123",
        name: "Old name",
        color: "#ffffff",
        ownerId: "user123",
        feeds: [],
    }),
}));

describe("POST /categories/newCategory", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        CategoryModel.findOne.mockResolvedValue(null);
        CategoryModel.create.mockImplementation((data) =>
            Promise.resolve({ _id: "category123", feeds: [], ...data })
        );
    });

    it("Should return 200 and { result: true, category: { name: 'category123', color: '#ffffff' } }", async () => {
        const payload = {
            name: "category123",
            color: "#ffffff",
        };

        const res = await request(app)
            .post("/categories/newCategory")
            .send(payload);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            result: true,
            category: payload,
        });
    });

    it("Should return 400 and { result: false, error: 'Missing or empty fields'} when one field is missing or empty", async () => {
        const res = await request(app).post("/categories/newCategory").send({
            name: "category123",
        });

        expect(res.status).toBe(400);
        expect(res.body.result).toBe(false);
        expect(res.body.error).toBe("Missing or empty fields");
    });

    it("Should return 409 and { result: false, error: 'Category already exists' } when category already exist", async () => {
        // Simulate an existing category
        CategoryModel.findOne.mockResolvedValue({
            _id: "existingCategoryId",
            name: "category123",
            color: "#ffffff",
            ownerId: "user123",
            feeds: [],
        });

        const res = await request(app).post("/categories/newCategory").send({
            name: "category123",
            color: "#222222",
        });

        expect(res.status).toBe(409);
        expect(res.body.result).toBe(false);
        expect(res.body.error).toBe("Category already exists");
    });
});

describe("PUT /categories/name", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        CategoryModel.findOne.mockResolvedValue(null);
        CategoryModel.findById.mockImplementation((id) =>
            id === "category123"
                ? {
                      _id: "category123",
                      name: "Old name",
                      color: "#ffffff",
                      ownerId: "user123",
                      feeds: [],
                  }
                : null
        );
        CategoryModel.findByIdAndUpdate.mockResolvedValue(true);
    });

    it("Should return 200 and { result: true }", async () => {
        const res = await request(app).put("/categories/name").send({
            categoryId: "category123",
            name: "New name",
        });

        expect(res.statusCode).toBe(200);
        expect(res.body.result).toBe(true);
    });

    it("Should return 400 and { result: false, error: 'Missing or empty fields'} when one field is missing or empty", async () => {
        const res = await request(app).put("/categories/name").send({
            categoryId: "category123",
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.result).toBe(false);
        expect(res.body.error).toBe("Missing or empty fields");
    });

    it("Should return 404 and { result: false, error: 'Category not found' } when category not found", async () => {
        const res = await request(app).put("/categories/name").send({
            categoryId: "otherCartegory",
            name: "Other name",
        });

        expect(res.statusCode).toBe(404);
        expect(res.body.result).toBe(false);
        expect(res.body.error).toBe("Category not found");
    });

    it("Should return 409 and { result: false, error: 'Category already exists' } when category already exist", async () => {
        CategoryModel.findOne.mockResolvedValueOnce({
            _id: "existingCategory",
            name: "Other name",
            ownerId: "user123",
        });

        const res = await request(app).put("/categories/name").send({
            categoryId: "category123",
            name: "Other name",
        });

        expect(res.statusCode).toBe(409);
        expect(res.body.result).toBe(false);
        expect(res.body.error).toBe("Category already exists");
    });

    it("Should return 401 and { result: false, error: 'Not authorized'} when not authorized", async () => {
        CategoryModel.findById.mockResolvedValueOnce({
            _id: "category123",
            name: "Old name",
            color: "#ffffff",
            ownerId: "user321",
            feeds: [],
        });
        const res = await request(app).put("/categories/name").send({
            categoryId: "category123",
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
