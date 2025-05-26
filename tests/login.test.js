const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const UserModel = require("../models/users.model");
const bcrypt = require("bcrypt");

//
let user;

beforeAll(async () => {
    // Définition du mot de passe comme pour l'enregistrer dans un controlleur
    // Mot de passe stocké en dur pour le réutiliser dans le test en dessous
    const hashed = bcrypt.hashSync("test", 10);

    user = await UserModel.create({
        username: "test",
        email: "test@test.com",
        password: hashed,
        categories: [],
        followedUsers: [],
        favoriteArticles: [],
        followers: 0,
        isPublic: false,
    });
});

describe("POST /auth/login", () => {
    it("should return a user if it exists", async () => {
        const res = await request(app).post("/auth/login").send({
            email: user.email,
            password: "test", // la recherche se fait avec le mdp en dur (comme sur l'application)
        });

        expect(res.body).toEqual(
            expect.objectContaining({
                result: true,
                user: {
                    username: "test",
                    token: expect.any(String),
                    categories: [],
                    followedUsers: [],
                    favoriteArticles: [],
                    followers: 0,
                    isPublic: false,
                    __v: 0, // Nécéssaire pour la comparaison de l'objet entier
                },
            })
        );
    });

    it("should return an error if the user doesn't exist", async () => {
        const res = await request(app).post("/auth/login").send({
            email: "ad@min.com",
            password: "admin",
        });
        expect(res.status).toBe(401);
        expect(res.body).toEqual({
            result: false,
            error: "Cannot use this email address",
        });
    });
    it("should return an error if a field is empty", async () => {
        const res = await request(app).post("/auth/login").send({
            email: "ad@min.com",
        });
        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            result: false,
            error: "Missing or empty fields",
        });
    });
});

afterAll(async () => {
    await UserModel.deleteOne({ email: user.email });
    await mongoose.connection.close();
});
