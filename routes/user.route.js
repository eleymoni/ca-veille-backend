var express = require("express");
const {
    deleteUser,
    getFollowedUsers,
} = require("../controllers/user.controller");
var router = express.Router();

router.get("/followed/:userId", getFollowedUsers);
router.delete("/:userId", deleteUser);

module.exports = router;
