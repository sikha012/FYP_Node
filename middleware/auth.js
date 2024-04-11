const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

const isAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).send({
            message: 'Access Token is missing'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).send({
                message: 'Invalid Access Token'
            });
        }
        req.user = user;
        next();
    });
};

module.exports = isAuth;
