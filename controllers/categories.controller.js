const Category = require("../models/categories.model");
const { checkBody } = require("../modules/checkBody");
const { tryCatch } = require("../utils/tryCatch");

exports.getCategoriesByOwner = tryCatch(async (req, res) => {
    // get categories of the current user with auth middleware
    const categories = await Category.find({ ownerId: req.id }).populate(
        "feeds"
    );
    if (!categories) {
        return res
            .status(404)
            .json({ result: false, error: "No categories found" });
    }
    return res.status(200).json({ result: true, data: categories });
});

exports.getCategoriesById = tryCatch(async (req, res) => {
    const id = req.params.id;

    // get categories of an user with awith id in param
    const categories = await Category.find({ ownerId: id }).populate("feeds");
    if (!categories) {
        return res
            .status(404)
            .json({ result: false, error: "No categories found" });
    }
    return res.status(200).json({ result: true, data: categories });
});
