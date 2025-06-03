const ArticleModel = require("../models/articles.model");
const UserModel = require("../models/users.model");
const { tryCatch } = require("../utils/tryCatch");

exports.toggleFavoriteArticle = tryCatch(async (req, res) => {
    const userId = req.id; //je récup grâce au middleware
    const articleId = req.params.articleId;

    //je checke si l'article existe
    const article = await ArticleModel.findById(articleId);
    if (!article)
        return res
            .status(404)
            .json({ result: false, error: "Article not found" });

    const user = await UserModel.findById(userId);

    const isFavorite = user.favoriteArticles.includes(articleId);

    if (isFavorite) {
        await UserModel.findByIdAndUpdate(userId, {
            $pull: { favoriteArticles: articleId },
        });
        return res
            .status(200)
            .json({ result: true, message: "Article removed from favorites" });
    } else {
        await UserModel.findByIdAndUpdate(
            userId,
            { $push: { favoriteArticles: articleId } } //double verif, addToSet au lieu de push : nécessaire ?
        );
        return res
            .status(200)
            .json({ result: true, message: "Article added to favorites" });
    }
});

exports.getArticleById = tryCatch(async (req, res) => {
    const { articleId } = req.params;

    const article = await ArticleModel.findById(articleId);
    if (!article) {
        return res
            .status(404)
            .json({ result: false, error: "Article not found" });
    }

    res.status(200).json({ result: true, article });
});

exports.getFavoritesArticlesByIds = tryCatch(async (req, res) => {
    if (!req.query.ids) {
        return res
            .status(400)
            .json({ result: false, error: "Missing articles ids" });
    }
    const ids = req.query.ids?.split(",");
    const articles = await ArticleModel.find({ _id: { $in: ids } });
    if (!articles || articles.length === 0) {
        return res
            .status(404)
            .json({ result: false, error: "Articles not found" });
    }
    const articlesSort = articles.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB - dateA;
    });
    res.status(200).json({ result: true, articles: articlesSort });
});
