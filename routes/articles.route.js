var express = require("express");
const {
    toggleFavoriteArticle,
    getArticleById,
    getFavoritesArticlesByIds,
} = require("../controllers/articles.controller");

var router = express.Router();

router.get("/favoritesArticlesId", getFavoritesArticlesByIds);

router.put("/favorites/:articleId", toggleFavoriteArticle);

router.get("/:articleId", getArticleById);

module.exports = router;
