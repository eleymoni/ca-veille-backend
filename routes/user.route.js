var express = require("express");
const { deleteUser, getFollowedUsers } = require("../controllers/user.controller");
var router = express.Router();

/* GET users listing. */
// router.get("/", function (req, res, next) {
//     res.json(req.id);
// });

router.get("/followed/:userId", getFollowedUsers);

router.delete("/:userId", deleteUser);

module.exports = router;
