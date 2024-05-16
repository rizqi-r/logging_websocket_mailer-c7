const router = require("express").Router();
const authControllers = require("../controllers/authControllers");
const emailControllers = require("../controllers/emailControllers");
const { restrict } = require("../middlewares/middleware");

router.post("/register", authControllers.register);
router.post("/login", authControllers.login);
router.get("/whoami", restrict, authControllers.whoAmI);

router.get("/verify", emailControllers.verifyEmail);
router.get("/request-verify", restrict, emailControllers.requestVerifyEmail);

router.post("/reset-password", restrict, emailControllers.resetPassword);
router.post("/request-reset-password", emailControllers.requestResetPassword);

module.exports = router;
