var express = require("express");
var router = express.Router();
const { createFeed } = require("../controllers/feeds.controller");

router.post("/create", createFeed);

module.exports = router;
