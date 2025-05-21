const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const UserModel = require("../models/users.model");
const { checkBody } = require("../modules/checkBody");
const { tryCatch } = require("../utils/tryCatch");

function generateAccessToken(id) {
    /* 
        3 paramètres à récupérer pour l'encodage:
        1/ les propriétés à encoder, ici ça sera uniquement l'id, 2/ la clé secrète, 3/ le délai d'expiration du token
    */
    return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
}

exports.register = tryCatch(async (req, res) => {
    const { username, email, password } = req.body;

    // Check for empty or missing fields
    if (!checkBody(req.body, ["username", "email", "password"])) {
        return res
            .status(400)
            .json({ result: false, error: "Missing or empty fields" });
    }

    // Check if user exists in DB
    const duplicate = await UserModel.findOne({ email });
    if (duplicate) {
        return res
            .status(409)
            .json({ result: false, error: "Cannot use this email address" });
    }

    // Encrypt token salt generation
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

exports.login = tryCatch(async (req, res) => {
    const { email, password } = req.body;

    // Check for empty or missing fields
    if (!checkBody(req.body, ["email", "password"])) {
        return res
            .status(400)
            .json({ result: false, error: "Missing or empty fields" });
    }

    // Check if user exists in DB
    const foundUser = await UserModel.findOne({ email });
    if (!foundUser || !bcrypt.compareSync(password, foundUser.password)) {
        return res
            .status(401)
            .json({ result: false, error: "Cannot use this email address" });
    }

    // Token generation
    const token = generateAccessToken(foundUser._id);

    const updatedUser = await UserModel.findOneAndUpdate(
        { _id: foundUser._id },
        { token: token },
        { new: true } // Retourne l'utilisateur mis à jour
    );

    return res.status(200).json({ result: true, user: updatedUser });
});
