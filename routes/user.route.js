var express = require("express");
const {
    deleteUser,
    getFollowedUsers,
    deleteUserCategory,
} = require("../controllers/user.controller");
var router = express.Router();

router.get("/followed/:userId", getFollowedUsers);
router.delete("/:userId", deleteUser);
router.delete("/category/:categoryId", deleteUserCategory);

module.exports = router;
