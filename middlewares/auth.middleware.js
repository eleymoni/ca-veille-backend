const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    // Récupération du header authorization/Authorization de la requête
    const authHeader = req.headers.authorization || req.headers.Authorization;

    // S'il n'y a pas de token, l'accès est refusé (Authentification échouée)
    if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);

    // Séparation de 'Bearer' et du token pour pouvoir le récupérer plus facilement (Bearer Token)
    const token = authHeader.split(" ")[1];

    // Décodage du token pour vérifier si l'id encodé correspond à l'id de l'utilisateur courant
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        // Si le token n'existe pas, l'accès est refusé (Autorisation refusée)
        if (err) return res.sendStatus(403);

        // Création de l'id récupéré dans le token dans req.id
        req.id = decoded.id;

        // Si tout est bon, l'id est disponible dans nos routes/controlleurs
        next();
    });
};

module.exports = authMiddleware;
