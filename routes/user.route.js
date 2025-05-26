var express = require("express");
const { deleteUser } = require("../controllers/user.controller");
var router = express.Router();

router.delete("/:userId", deleteUser);

module.exports = router;
