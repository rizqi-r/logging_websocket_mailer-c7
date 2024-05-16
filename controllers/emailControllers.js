const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Sentry = require("../libs/sentry");
const { getHTML, sendEmail } = require("../libs/nodemailer");

/**
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query;
        jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
            if (err) {
                return res.send("<h1>Failed to verify</h1>");
            }

            const user = await prisma.user.findUnique({
                where: {
                    id: data.id
                }
            });

            if (!user) {
                res.status(400).send("<h1>User not found</h1>");
            }

            await prisma.user.update({
                data: {
                    is_verified: true
                },
                where: {
                    id: user.id
                }
            });

            global.io.emit(`user-${user.id}`, {
                email_status: "Verified"
            });

            return res.send("<h1>success</h1>");
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
const requestVerifyEmail = async (req, res, next) => {
    try {
        const name = req.user.name || req.user.email.split("@")[0];
        const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {expiresIn: "30m"});
        const url = `${req.protocol}://${req.get("host")}/api/v1/verify?token=${token}`;
        const html = await getHTML("verification-code.ejs", { name: name, verification_code: token, verification_url: url });

        await sendEmail(req.user.email, "Email Verification", html);
        return res.send("A verification link has been sent to your email account. The token will expire in 30 minutes.");
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
        const { password, confirmpassword } = req.body;

        if (password !== confirmpassword) {
            return res.status(401).send("<h1>Password and confirm password does not match");
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
            if (err) {
                return res.send("<h1>Failed to verify</h1>");
            }

            const user = await prisma.user.findUnique({
                where: {
                    id: data.id
                }
            });

            if (!user) {
                res.send("<h1>User not found</h1>");
            }

            await prisma.user.update({
                data: {
                    password: encryptedPassword
                },
                where: {
                    id: user.id
                }
            });

            await prisma.notification.create({
                data: {
                    title: "Reset Password",
                    body: "Your password has been changed successfully!",
                    userId: user.id
                }
            });

            global.io.emit(`user-${user.id}`, {
                title: "Reset Password",
                body: "Your password has been changed successfully!",
                user_id: user.id
            });

            return res.send("<h1>success</h1>");
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
const requestResetPassword = async (req, res, next) => {
    try {
        const email = req.body.email;

        if (!email) {
            return res.send("email not provided");
        }

        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!user) {
            return res.send("user not found");
        }

        const name = user.name || user.email.split("@")[0];
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {expiresIn: "5m"});
        const url = `${req.protocol}://${req.get("host")}/reset-password?token=${token}`;
        const html = await getHTML("forgot-password.ejs", { name, url });

        await sendEmail(user.email, "Reset password", html);

        return res.send(`We have emailed your password reset link to ${user.email}. The token will expire in 5 minutes.`);
    } catch (error) {
        Sentry.captureException(error);
        next(error);
    }
};

module.exports = {
    verifyEmail,
    requestVerifyEmail,
    resetPassword,
    requestResetPassword
};
