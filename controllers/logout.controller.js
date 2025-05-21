const UserModel = require("../models/users.model");
const { tryCatch } = require("../utils/tryCatch");

exports.logout = tryCatch(async (req, res) => {
    const { id } = req;

    await UserModel.findByIdAndUpdate(
        { _id: id },
        { token: "" },
        { new: true }
    );

    return res.json({ result: true, message: "User successfuly disconnected" });
});
