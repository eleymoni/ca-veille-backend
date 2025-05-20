const mongoose = require("mongoose");

const feedsSchema = mongoose.Schema({
    url: { type: String, require: true },
    articles: [{ type: mongoose.Types.ObjectId, ref: "articles" }],
    defaultMedia: String,
});

const FeedsModel = mongoose.model("feeds", feedsSchema);
module.exports = FeedsModel;
