const { tryCatch } = require("../utils/tryCatch");
const UserModel = require("../models/users.model");

exports.deleteUser = tryCatch(async () => {});

exports.getFollowedUsers = tryCatch(async (req, res) => {
    const {userId} = req.params;

    const user = await UserModel.findById(userId).populate("followedUsers");

    if (!user) {
        return res.status(404).json({message: "User not found"});
    }

    res.status(200).json(user.followedUsers);
});