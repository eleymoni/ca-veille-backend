var express = require("express");
const { addFavoriteArticle, getArticleById, removeFavoriteArticle } = require("../controllers/articles.controller");

var router = express.Router();

router.post("/favorites/:articleId", addFavoriteArticle);

router.get("/:id", getArticleById);

router.delete("/favorites/:articleId", removeFavoriteArticle);

module.exports = router;