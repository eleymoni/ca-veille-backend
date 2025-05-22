const mongoose = require("mongoose");

const feedsSchema = mongoose.Schema({
    url: { type: String, require: true },
    name: { type: String, require: true },
    articles: [{ type: mongoose.Types.ObjectId, ref: "articles" }],
    defaultMedia: { type: String, default: null },
});

const FeedModel = mongoose.model("feeds", feedsSchema);
module.exports = FeedModel;
