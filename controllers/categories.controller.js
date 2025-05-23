const CategoryModel = require("../models/categories.model");
const FeedModel = require("../models/feeds");
const UserModel = require("../models/users.model");
const { checkBody } = require("../modules/checkBody");
const { tryCatch } = require("../utils/tryCatch");

// get articles of cartegories by id, feeds merged sort by date
// exemple fetch : const ids = [1, 2, 3]; fetch(`/api/users?ids=${ids.join(',')}`);
exports.getCategoriesById = tryCatch(async (req, res) => {
    if (!req.query.ids) {
        return res
            .status(400)
            .json({ result: false, error: "Missing categories ids" });
    }
    const ids = req.query.ids?.split(",");
    // method to find in a array of ids, and to populate on multiple leveles
    const categories = await CategoryModel.find({ _id: { $in: ids } }).populate(
        {
            path: "feeds",
            populate: { path: "articles" },
        }
    );
    if (!categories || categories.length === 0) {
        return res
            .status(404)
            .json({ result: false, error: "Categories not found" });
    }
    const categoriesList = categories.map((category) => {
        const articles = [];
        category.feeds.map((feed) => {
            feed.articles.map((article) => {
                articles.push(article);
            });
        });
        articles.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
        });
        return {
            _id: category._id,
            name: category.name,
            color: category.color,
            articles,
        };
    });
    res.json({ result: true, categoriesList });
});

// get articles  of an array of user with id in query, feeds merged sort by date
exports.getCategoriesByUserId = tryCatch(async (req, res) => {
    if (!req.query.ids) {
        return res
            .status(400)
            .json({ result: false, error: "Missing categories ids" });
    }
    const ids = req.query.ids?.split(",");
    const users = await UserModel.find({ _id: { $in: ids } }).populate({
        path: "categories",
        populate: { path: "feeds", populate: { path: "articles" } },
    });
    if (!users || users.length === 0) {
        return res
            .status(404)
            .json({ result: false, error: "Users not found" });
    }
    const userCategoriesList = users.map((user) => {
        let userObject = {
            username: user.username,
            articles: [],
        };
        user.categories.map((category) => {
            const articles = [];
            category.feeds.map((feed) => {
                feed.articles.map((article) => articles.push(article));
            });
            userObject.articles = [...userObject.articles, ...articles];
        });
        userObject.articles.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
        });
        return userObject;
    });
    res.json({ result: true, users: userCategoriesList });
});

exports.deleteCategoryById = tryCatch(async (req, res) => {
    const user = req.id;
    const categoryId = req.params.categoryId.trim();

    const findCategory = await CategoryModel.findById(categoryId);
    if (!findCategory) {
        return res
            .status(404)
            .json({ result: false, error: "Category not found" });
    }

    if (findCategory.ownerId.toString() !== user) {
        return res.status(401).json({ result: false, error: "Not authorized" });
    }

    await CategoryModel.deleteOne({ _id: categoryId });

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
    const categoryExists = await CategoryModel.findOne({
        name: { $regex: new RegExp(name, "i") },
        ownerId: user,
    });
    if (categoryExists) {
        return res
            .status(409)
            .json({ result: false, error: "Category already exists" });
    }

    const newCategory = await CategoryModel.create({
        name: name.trim(),
        color: color.trim(),
        ownerId: user,
    });
    return res.status(200).json({ result: true, category: newCategory });
});

// updata color of the category if name is different
exports.updateColorCategory = tryCatch(async (req, res) => {
    if (!checkBody(req.body, ["categoryId", "color"])) {
        return res
            .status(400)
            .json({ result: false, error: "Missing or empty fields" });
    }
    const user = req.id;
    const { color, categoryId } = req.body;
    const findCategory = await CategoryModel.findById(categoryId);
    if (!findCategory) {
        return res
            .status(404)
            .json({ result: false, error: "Category not found" });
    }
    if (findCategory.ownerId.toString() !== user) {
        return res.status(401).json({ result: false, error: "Not authorized" });
    }
    if (findCategory.color.toString() === color.trim()) {
        return res
            .status(401)
            .json({ result: false, error: "Color already in use" });
    }
    const updatedCategory = await CategoryModel.findByIdAndUpdate(categoryId, {
        color: color.trim(),
    });
    return res.status(200).json({ result: true });
});

// update the  category name only if the owner dosn't have a category with the same name
exports.updateNameCategory = tryCatch(async (req, res) => {
    if (!checkBody(req.body, ["categoryId", "name"])) {
        return res
            .status(400)
            .json({ result: false, error: "Missing or empty fields" });
    }
    const user = req.id;
    const { name, categoryId } = req.body;
    const findCategory = await CategoryModel.findById(categoryId);
    if (!findCategory) {
        return res
            .status(404)
            .json({ result: false, error: "Category not found" });
    }
    if (findCategory.ownerId.toString() !== user) {
        return res.status(401).json({ result: false, error: "Not authorized" });
    }
    const categoryExists = await CategoryModel.findOne({
        name: { $regex: new RegExp(name.trim(), "i") },
        ownerId: user,
    });
    if (categoryExists) {
        return res
            .status(409)
            .json({ result: false, error: "Category already exists" });
    }
    const updatedCategory = await CategoryModel.findByIdAndUpdate(categoryId, {
        name: name.trim(),
    });
    return res.status(200).json({ result: true });
});
