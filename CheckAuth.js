import jwt from 'jsonwebtoken';

export default (req, res, next) => {
    const token = (req.headers.authorization || '')
        .replace(/Bearer\s?/, '')
        .replace('"', '')
        .replace('"', ''); // get token
    if (token) {
        try {
            const decoded = jwt.verify(token, 'gEnShIn'); // decode the token
            req.userId = decoded._id; // insert in req
            next(); // go next step
        } catch (e) {
            return res.status(403).json({
                message: 'Нет доступа(jwt)',
                reason: e,
            });
        }
    } else {
        return res.status(403).json({
            message: 'Нет доступа',
        });
    }
};