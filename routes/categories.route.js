var express = require("express");
const {
    getCategories,
    getCategoriesById,
} = require("../controllers/categories.controller");

var router = express.Router();

// router.get("/current", getCategories);

// router.get("/:id", getCategoriesById);

module.exports = router;
