var express = require("express");
const { deleteUser } = require("../controllers/user.controller");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
    res.json(req.id);
});

router.delete("/:userId", deleteUser);

module.exports = router;
