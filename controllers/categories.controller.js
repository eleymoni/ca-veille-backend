const Category = require("../models/categories.model");
const { checkBody } = require("../modules/checkBody");
const { tryCatch } = require("../utils/tryCatch");

// get categories of an user with awith id in param
exports.getCategoriesByUserId = tryCatch(async (req, res) => {
    const userId = req.params.userId;
    if (!userId) {
        return res.status(401).json({ result: false, error: "Not authorized" });
    }

    const user = await Category.find({ ownerId: userId });
    if (!user) {
        return res.status(401).json({ result: false, error: "Not authorized" });
    }
    const categories = await Category.find({ ownerId: userId }).populate(
        "feeds"
    );
    return res.status(200).json({ result: true, categories });
});

exports.deleteCategoryById = tryCatch(async (req, res) => {
    const user = req.id;
    const categoryId = req.params.categoryId;

    const findCategory = await Category.findById(categoryId);
    if (!findCategory) {
        return res
            .status(404)
            .json({ result: false, error: "Category not found" });
    }

    if (findCategory.ownerId.toString() !== user) {
        return res.status(401).json({ result: false, error: "Not authorized" });
    }

    await Category.deleteOne({ _id: categoryId });

    return res.status(200).json({ result: true });
});

// create a new category only if the owner dosn't have a category with the same name
exports.createCategory = tryCatch(async (req, res) => {
    if (!checkBody(req.body, ["name", "color"])) {
        return res
            .status(400)
            .json({ result: false, error: "Missing or empty fields" });
    }
    const user = req.id;
    const { name, color } = req.body;
    const categoryExists = await Category.findOne({
        name: { $regex: new RegExp(name, "i") },
        ownerId: user,
    });
    if (categoryExists) {
        return res
            .status(409)
            .json({ result: false, error: "Category already exists" });
    }

    const newCategory = await Category.create({
        name,
        color,
        ownerId: user,
    });
    return res.status(200).json({ result: true, category: newCategory });
});

exports.updateColorCategory = tryCatch(async (req, res) => {
    if (!checkBody(req.body, ["categoryId", "color"])) {
        return res
            .status(400)
            .json({ result: false, error: "Missing or empty fields" });
    }
    const user = req.id;
    const { color, categoryId } = req.body;
    const findCategory = await Category.findById(categoryId);
    if (!findCategory) {
        return res
            .status(404)
            .json({ result: false, error: "Category not found" });
    }
    if (findCategory.ownerId.toString() !== user) {
        return res.status(401).json({ result: false, error: "Not authorized" });
    }
    if (findCategory.color.toString() === color) {
        return res
            .status(401)
            .json({ result: false, error: "Color already in use" });
    }
    const updatedCategory = await Category.findByIdAndUpdate(categoryId, {
        color: color,
    });
    return res.status(200).json({ result: true });
});

exports.updateNameCategory = tryCatch(async (req, res) => {
    if (!checkBody(req.body, ["categoryId", "name"])) {
        return res
            .status(400)
            .json({ result: false, error: "Missing or empty fields" });
    }
    const user = req.id;
    const { name, categoryId } = req.body;
    const findCategory = await Category.findById(categoryId);
    if (!findCategory) {
        return res
            .status(404)
            .json({ result: false, error: "Category not found" });
    }
    if (findCategory.ownerId.toString() !== user) {
        return res.status(401).json({ result: false, error: "Not authorized" });
    }
    const categoryExists = await Category.findOne({
        name: { $regex: new RegExp(name, "i") },
        ownerId: user,
    });
    if (categoryExists) {
        return res
            .status(409)
            .json({ result: false, error: "Category already exists" });
    }
    const updatedCategory = await Category.findByIdAndUpdate(categoryId, {
        name: name,
    });
    return res.status(200).json({ result: true });
});
