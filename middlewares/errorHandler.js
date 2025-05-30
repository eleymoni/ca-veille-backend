// dernier middleware appellé de l'app, qui renvoie une erreur 500, si un des middlewares comporte une erreur
exports.errorHandler = (err, req, res, next) => {
    return res.status(500).json(err.message);
};
