var express = require("express");
const {
    getCategoriesById,
    getCategoriesByUserId,
    deleteCategoryById,
    createCategory,
    updateColorCategory,
    updateNameCategory,
    getPopularUsers,
    getUserArticles,
} = require("../controllers/categories.controller");

var router = express.Router();
router.get("/home", getUserArticles);
// require query ids example : const ids = [1, 2, 3]; fetch(`/api/users?ids=${ids.join(',')}`);
router.get("/categoriesId", getCategoriesById);
// require query ids example : const ids = [1, 2, 3]; fetch(`/api/users?ids=${ids.join(',')}`);
router.get("/usersId", getCategoriesByUserId);
router.get("/populars", getPopularUsers);
router.delete("/:categoryId", deleteCategoryById);
router.post("/newCategory", createCategory);
router.put("/color", updateColorCategory);
router.put("/name", updateNameCategory);

module.exports = router;
