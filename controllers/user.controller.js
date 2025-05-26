const { tryCatch } = require("../utils/tryCatch");
const UserModel = require("../models/users.model");

exports.deleteUser = tryCatch(async (req, res) => {
    const { id } = req;
    const { userId } = req.params;

    // Check if an id is sent by the auth middleware
    if (!id)
        return res
            .status(401)
            .json({ result: false, error: "No userID found" });

    // Check if the user is allowed to perform the action
    if (id !== userId)
        return res.status(403).json({
            result: false,
            error: "You can delete only your account",
        });

    // Check if the user exists in the db to delete it
    const foundUser = await UserModel.findByIdAndDelete(userId);
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
