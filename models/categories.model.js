const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
    name: { type: String, required: true },
    color: String,
    ownerId: { type: mongoose.Types.ObjectId, ref: "users" },
    feeds: [{ type: mongoose.Types.ObjectId, ref: "feeds" }],
});

const CategoryModel = mongoose.model("categories", categorySchema);

module.exports = CategoryModel;
