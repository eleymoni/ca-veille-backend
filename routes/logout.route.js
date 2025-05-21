var express = require("express");
const { logout } = require("../controllers/logout.controller");

var router = express.Router();

router.post("/", logout);

module.exports = router;
