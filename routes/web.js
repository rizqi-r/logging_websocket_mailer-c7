const router = require("express").Router();
const baseControllers = require("../controllers/baseControllers");
const { restrict } = require("../middlewares/middleware");

router.get("/", baseControllers.index);
router.get("/register", baseControllers.register);
router.get("/login", baseControllers.login);
router.get("/dashboard", restrict, baseControllers.dashboard);
router.get("/forgot-password", baseControllers.forgotPassword);
router.get("/reset-password", restrict, baseControllers.resetPassword);

module.exports = router;
