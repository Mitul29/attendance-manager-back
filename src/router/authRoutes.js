const { Router } = require("express");
const router = Router();

const validateMiddleware = require("../middleware/validationMiddleware");
const isAuth = require("../middleware/authMiddleware");
const authController = require("../controllers/authController");

router.post(
  "/login",
  validateMiddleware.validateLoginFields,
  authController.login
);

router.get("/logged-in", isAuth(), authController.getLoggedIn);

module.exports = router;
