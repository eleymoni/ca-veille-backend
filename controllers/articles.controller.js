const ArticleModel = require("../models/articles.model");
const UserModel = require("../models/users.model");
const { tryCatch } = require("../utils/tryCatch");

exports.addFavoriteArticle = tryCatch(async (req, res) => {
    const userId = req.id; //je récup grâce au middleware
    const articleId = req.params.articleId;

    if (!articleId) {
        return res
            .status(400)
            .json({ result: false, error: "Missing articleId parameter" });
    }

    //je checke si l'article existe
    const article = await ArticleModel.findById(articleId);
    if (!article)
        return res
            .status(404)
            .json({ result: false, error: "Article not found" });

    //j'ajoute l'article s'il est pas déjà dans les fav.
    const user = await UserModel.findById(userId);

    if (!user.favoritesArticles.includes(articleId)) {
        user.favoritesArticles.push(articleId);
        await user.save();
        return res
            .status(200)
            .json({ result: true, message: "Article added to favorites" });
    } else {
        return res
            .status(409)
            .json({ result: true, message: "Article already in favorites" });
    }
});

exports.removeFavoriteArticle = tryCatch(async (req, res) => {
    const userId = req.id;
    const articleId = req.params.articleId;

    if (!articleId) {
        return res
            .status(400)
            .json({ result: false, error: "Missing articleId parameter" });
    }

    const user = await UserModel.findById(userId);

    const initialLength = user.favoritesArticles.length;

    user.favoritesArticles = user.favoritesArticles.filter(
        //je filter sur le tableau d'Id
        (id) => id.toString() !== articleId
    ); //toString obligé sinon je compare une string avec un objectId mongoDb = aie!
    await user.save();

    if (user.favoritesArticles.length === initialLength) {
        return res
            .status(404)
            .json({ result: false, message: "Article not found in favorites" });
    }
    res.status(200).json({
        result: true,
        message: "Article removed from favorites",
    });
});

exports.getArticleById = tryCatch(async (req, res) => {
    const article = await ArticleModel.findById(req.params.id);
    if (!article)
        return res
            .status(404)
            .json({ result: false, error: "Article not found" });
    res.status(200).json({ result: true, article });
});
