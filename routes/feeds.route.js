var express = require("express");
var router = express.Router();
const {
    createFeed,
    getFeedsByCategory,
} = require("../controllers/feeds.controller");

router.post("/create", createFeed);

router.get("/:categoryId", getFeedsByCategory);

module.exports = router;
