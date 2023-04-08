const { Router } = require("express");
const router = Router();

const { USER_ROLE } = require("../models/User");
const isAuth = require("../middleware/authMiddleware");

const validationMiddleware = require("../middleware/validationMiddleware");
const userController = require("../controllers/userController");

router
  .route("/")
  .get(isAuth(USER_ROLE.ADMIN), userController.getAllUsers)
  .post(
    isAuth(USER_ROLE.ADMIN),
    validationMiddleware.validateAddUserField,
    userController.addUser
  );

router
  .route("/:id")
  .put(isAuth(USER_ROLE.ADMIN), userController.editUser)
  .delete(isAuth(USER_ROLE.ADMIN), userController.deleteUser);

module.exports = router;
