const mongoose = require("mongoose");

const articleSchema = mongoose.Schema({
    url: { type: String, required: true },
    title: String,
    description: String,
    media: String,
    date: Date,
    author: String,
    defaultMedia: String, // image partagée avec le feed qui contient l'article
});

const ArticleModel = mongoose.model("articles", articleSchema);

module.exports = ArticleModel;
