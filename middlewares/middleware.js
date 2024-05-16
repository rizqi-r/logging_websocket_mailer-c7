const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

const restrict = (req, res, next) => {
    try {
        let { authorization } = req.headers;
        if (!authorization || !authorization.split(" ")[1]) {
            const token = req.query.token;
            if (!token) {
                return res.status(401).json({
                    status: 401,
                    message: "Token not provided!"
                });
            }

            return jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
                if (err) {
                    return res.status(401).json({
                        status: 401,
                        message: err.message
                    });
                }

                const user = await prisma.user.findFirst({
                    where: {
                        id: data.id
                    }
                });

                delete user.password;
                req.user = user;
                next();
            });
        }

        const token = authorization.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
            if (err) {
                return res.status(401).json({
                    status: 401,
                    message: err.message
                });
            }

            const user = await prisma.user.findFirst({
                where: {
                    id: data.id
                }
            });

            delete user.password;
            req.user = user;
            next();
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    restrict
};
