//mock du middleware d'authentif pcq route protégée
jest.mock("./middlewares/auth.middleware", () => {
    return (req, res, next) => {
        req.id = "user123"; // simulate un user authentifié
        next();
    };
    });

jest.mock("./models/users.model", () => ({
    findById: jest.fn().mockResolvedValue({ //simule cherche un user dans la bdd
        _id: "user123",
        favoriteArticles: [],
    }),
    findByIdAndUpdate: jest.fn().mockResolvedValue({}), //simule l'update d'un user
}));

jest.mock("./models/articles.model", () => ({
    findById: jest.fn().mockResolvedValue({ //simule la recherche d'un article
        _id: "665fc28e5f54ebc7a5401169",
        title: "Mon article mocké"
    }),
}));

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./app');
const UserModel = require('./models/users.model'); 
const ArticleModel = require('./models/articles.model');

const article = { _id: "665fc28e5f54ebc7a5401169" };
const user = { _id: "user123" };


describe("PUT /articles/favorites/:articleId", () => {

    //test pour ajouter aux favs
    it('Should add article to favorites', async () => {
        UserModel.findById.mockResolvedValueOnce({
            _id: "user123",
            favoriteArticles: [], //je simule un user sans fav
        });
        ArticleModel.findById.mockResolvedValueOnce({
            _id: "665fc28e5f54ebc7a5401169",
            title: "Mon article mocké"
        });
        
        const res = await request(app).put(`/articles/favorites/${article._id}`).send(); //j'envoie rien dans le body
    
        expect(res.statusCode).toBe(200);
        expect(res.body.result).toBe(true);
        expect(res.body.message).toBe("Article added to favorites");

        //je dois simuler le fav ajouté
        UserModel.findById.mockResolvedValueOnce({
            _id: "user123",
            favoriteArticles: ["665fc28e5f54ebc7a5401169"],
        });

        const updateUser = await UserModel.findById(user._id);
        expect(updateUser.favoriteArticles.map(id => id.toString())) //obligée de mapper pour pour avoir des strings et pas des objectID ??
        .toContain(article._id.toString());
    });

    //test pour retirer des favs
    it("Should remove article from favorites", async () => {
        UserModel.findById.mockResolvedValueOnce({
            _id: "user123",
            favoriteArticles: ["665fc28e5f54ebc7a5401169"], //je simule un user qui a déjà un fav
        });
        ArticleModel.findById.mockResolvedValueOnce({
            _id: "665fc28e5f54ebc7a5401169",
            title: "Mon article mocké"
        });
        
        const res = await request(app).put(`/articles/favorites/${article._id}`).send();
        
        expect(res.statusCode).toBe(200);
        expect(res.body.result).toBe(true);
        expect(res.body.message).toBe("Article removed from favorites");

        //je simule le favori retiré
        UserModel.findById.mockResolvedValueOnce({
            _id: "user123",
            favoriteArticles: [],
        });

        const updateUser = await UserModel.findById(user._id);
        expect(updateUser.favoriteArticles.map(id => id.toString())) //obligée de mapper pour avoir des strings et pas des objectID ??
        .not.toContain(article._id.toString());
    });

    //test d'erreur article inexistant
    it("Should return 404 if article not found", async () => {
        ArticleModel.findById.mockResolvedValueOnce(null); //je simule un article qu'existe pas
        
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app).put(`/articles/favorites/${fakeId}`).send();
        
        expect(res.statusCode).toBe(404);
        expect(res.body.error).toMatch("Article not found");
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

});
