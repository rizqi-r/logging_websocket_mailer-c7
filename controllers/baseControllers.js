const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const Sentry = require("../libs/sentry");

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const index = async (req, res, next) => {
    try {
        res.status(200).json({
            status: 200,
            message: "OK"
        });
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
const register = async (req, res, next) => {
    try {
        res.render("register");
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
        res.render("login");
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
const dashboard = async (req, res, next) => {
    try {
        const token = req.query.token;
        const user = await prisma.user.findUnique({
            where: {
                email: req.user.email
            }
        });

        if (!user) {
            return res.send("user not found");
        }

        const notification = await prisma.notification.findMany({
            orderBy: {
                id: "desc"
            },
            where: {
                userId: user.id
            }
        });

        const hostname = `${req.protocol}://${req.get("host")}`;

        const emailStatus = user.is_verified ? "Verified" : "Unverified";

        return res.render("dashboard", { user_id: user.id, email: user.email, email_status: emailStatus, notifications: notification, token: token, url: hostname });
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
const resetPassword = async (req, res, next) => {
    try {
        const token = req.query.token;
        res.render("reset-password", { token });
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
const forgotPassword = async (req, res, next) => {
    try {
        const token = req.query.token;
        res.render("send-mail", { token });
    } catch (error) {
        Sentry.captureException(error);
        next(error);
    }
};

module.exports = {
    index,
    login,
    register,
    dashboard,
    resetPassword,
    forgotPassword
};
