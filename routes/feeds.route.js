var express = require("express");
var router = express.Router();
const {
    createFeed,
    getFeedsByCategory,
    getAllFeedsWithCategories,
} = require("../controllers/feeds.controller");

router.post("/create", createFeed);
router.get("/:categoryId", getFeedsByCategory);
router.get("/", getAllFeedsWithCategories);

module.exports = router;
