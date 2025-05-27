var express = require("express");
const {
    deleteUser,
    getFollowedUsers,
    deleteFollowedUserById
} = require("../controllers/user.controller");
var router = express.Router();

router.get("/followed/:userId", getFollowedUsers);
router.delete("/:userId", deleteUser);
router.delete("/followed/:followedUserId", deleteFollowedUserById);

module.exports = router;
