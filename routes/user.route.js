var express = require("express");
const {
    deleteUser,
    getFollowedUsers,
    getEmail,
    getIsPublic,
    deleteUserCategory,
    deleteFollowedUserById,
    addFollowedUserById,
    toggleIsPublic,
} = require("../controllers/user.controller");
var router = express.Router();

router.get("/followed/:userId", getFollowedUsers);
router.get("/email", getEmail);
router.get("/isPublic", getIsPublic);
router.delete("/", deleteUser);
router.delete("/category/:categoryId", deleteUserCategory);
router.delete("/followed/:followedUserId", deleteFollowedUserById);
router.post("/followed/:userToFollowId", addFollowedUserById);
router.put("/isPublic", toggleIsPublic);

module.exports = router;
