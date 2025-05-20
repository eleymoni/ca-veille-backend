const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserModel = require("../models/User");
const { checkBody } = require("../modules/checkBody");
const { tryCatch } = require("../utils/tryCatch");

function generateAccessToken(id) {
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
}

exports.registerController = tryCatch(async (req, res) => {
    const { username, email, password } = req.body;

    // Check for empty or missing fields
    if (!checkBody(req.body, ["username", "email", "password"])) {
        return res
            .status(400)
            .json({ result: false, error: "Missing or empty fields" });
    }

    // Check if user exists in DB
    const foundUser = await UserModel.findOne({ email });
    if (foundUser) {
        return res
            .status(409)
            .json({ result: false, error: "Cannot use this email address" });
    }

    // Encrypt generation
    const salt = parseInt(process.env.SALT);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
    });

    const createdUser = await newUser.save();

    // Token generation
    const token = generateAccessToken(createdUser._id);

    await UserModel.updateOne({ _id: createdUser._id }, { token: token });

    return res.status(201).json({ result: true, token });
});
