var express = require("express");
const {
    deleteUser,
    getFollowedUsers,
    getEmail,
    deleteUserCategory,
    deleteFollowedUserById,
} = require("../controllers/user.controller");
var router = express.Router();

router.get("/followed/:userId", getFollowedUsers);
router.get("/email", getEmail);
router.delete("/:userId", deleteUser);
router.delete("/category/:categoryId", deleteUserCategory);
router.delete("/followed/:followedUserId", deleteFollowedUserById);

module.exports = router;
