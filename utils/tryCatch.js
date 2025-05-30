// si le controller comporte une erreur, passe l'erreur au errorHandler (dernier middleware de l'app)
exports.tryCatch = (controller) => async (req, res, next) => {
    try {
        await controller(req, res);
    } catch (error) {
        return next(error);
    }
};
