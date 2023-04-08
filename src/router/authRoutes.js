const { Router } = require("express");
const router = Router();

const validateMiddleware = require("../middleware/validationMiddleware");
const authController = require("../controllers/authController");

router.post(
  "/login",
  validateMiddleware.validateLoginFields,
  authController.login
);

module.exports = router;
