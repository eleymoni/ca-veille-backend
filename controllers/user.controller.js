const { tryCatch } = require("../utils/tryCatch");
const UserModel = require("../models/users.model");
const CategoryModel = require("../models/categories.model");

exports.deleteUser = tryCatch(async (req, res) => {
    const { id } = req;

    // Check if an id is sent by the auth middleware
    if (!id)
        return res
            .status(401)
            .json({ result: false, error: "No userID found" });

    await CategoryModel.deleteMany({ ownerId: id });

    // Check if the user exists in the db to delete it
    const foundUser = await UserModel.findByIdAndDelete(id);
    if (!foundUser)
        return res
            .status(404)
            .json({ result: false, error: "such user doesn't exist" });

    return res.json({ result: true });
});

exports.getFollowedUsers = tryCatch(async (req, res) => {
    const { userId } = req.params;

    const user = await UserModel.findById(userId).populate("followedUsers");

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.followedUsers);
});

exports.getEmail = tryCatch(async (req, res) => {
    const userId = req.id;
    const user = await UserModel.findById(userId);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.email);
});

exports.getIsPublic = tryCatch(async (req, res) => {
    const userId = req.id;
    const user = await UserModel.findById(userId);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.isPublic);
});

exports.deleteUserCategory = tryCatch(async (req, res) => {
    const { categoryId } = req.params;

    const foundUser = await UserModel.findOne({ _id: req.id });

    if (!foundUser)
        return res.status(403).json({ result: false, error: "Not Authorized" });

    const updatedCategories = foundUser.categories.filter(
        (el) => el.toString() !== categoryId
    );

    foundUser.categories = updatedCategories;
    await foundUser.save();

    return res.json({ result: true, foundUser });
});

exports.deleteFollowedUserById = tryCatch(async (req, res) => {
    const { followedUserId } = req.params;
    const { id } = req;

    const user = await UserModel.findById(id);

    if (!user) {
        return res.status(404).json({ result: false, error: "User not found" });
    }

    const updatedUser = user.followedUsers.filter(
        (el) => el.toString() !== followedUserId
    );

    user.followedUsers = updatedUser;
    await user.save();

    res.json({
        result: true,
        followedUsers: user.followedUsers,
    });
});

exports.addFollowedUserById = tryCatch(async (req, res) => {
    const { userToFollowId } = req.params;
    const { id } = req;

    const user = await UserModel.findById(id);

    if (!user) {
        return res.status(404).json({ result: false, error: "User not found" });
    }

    if (user.followedUsers.includes(userToFollowId)) {
        return res
            .status(400)
            .json({ result: false, error: "User already followed" });
    }

    user.followedUsers.push(userToFollowId);
    await user.save();

    res.json({
        result: true,
        followedUsers: user.followedUsers,
    });
});

exports.toggleIsPublic = tryCatch(async (req, res) => {
    const userId = req.id;
    const user = await UserModel.findById(userId);

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    user.isPublic = !user.isPublic;
    await user.save();

    res.status(200).json(user.isPublic);
});
