var express = require("express");
const { registerController } = require("../controllers/AuthController");
var router = express.Router();

router.post("/register", registerController);

module.exports = router;
