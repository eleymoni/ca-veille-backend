var express = require("express");
const {
    getCategoriesByUserId,
    deleteCategoryById,
    createCategory,
    updateColorCategory,
    updateNameCategory,
} = require("../controllers/categories.controller");

var router = express.Router();

router.get("/:userId", getCategoriesByUserId);
router.delete("/:categoryId", deleteCategoryById);
router.post("/newCategory", createCategory);
router.put("/color", updateColorCategory);
router.put("/name", updateNameCategory);

module.exports = router;
