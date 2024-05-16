const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Sentry = require("../libs/sentry");

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).send("Bad Request");
        }

        const exist = await prisma.user.findUnique({ where: { email: email } });

        if (exist) {
            return res.status(401).send("Email has already been used");
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: encryptedPassword
            }
        });

        delete user.password;

        await prisma.notification.create({
            data: {
                title: `Welcome ${user.name}`,
                body: "Please confirm your email by clicking request verify button!",
                userId: user.id
            }
        });

        global.io.emit(`user-${user.id}`, {
            title: `Welcome ${user.name}`,
            body: "Please confirm your email by clicking request verify button!",
            user_id: user.id
        });

        return res.status(201).redirect(`${req.protocol}://${req.get("host")}/login`);
    } catch (error) {
        Sentry.captureException(error);
        next(error);
    }
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send("Bad Request");
        }

        const user = await prisma.user.findUnique({ where: { email: email } });
        if (!user) {
            return res.status(401).send("invalid email or password!");
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(401).send("invalid email or password!");
        }

        delete user.password;

        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

        return res.redirect(`${req.protocol}://${req.get("host")}/dashboard?token=${token}`);
    } catch (error) {
        Sentry.captureException(error);
        next(error);
    }
};

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const whoAmI = async (req, res, next) => {
    try {
        return res.status(200).json({
            status: 200,
            message: "OK",
            data: req.user
        });
    } catch (error) {
        Sentry.captureException(error);
        next(error);
    }
};

module.exports = {
    register,
    login,
    whoAmI
};
