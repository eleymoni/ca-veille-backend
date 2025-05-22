var express = require("express");
const { toggleFavoriteArticle, getArticleById } = require("../controllers/articles.controller");

var router = express.Router();

router.put("/favorites/:articleId", toggleFavoriteArticle);

router.get("/:articleId", getArticleById);

module.exports = router;