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

router.route("/hierarchy").get(isAuth(), userController.getUsersHierarchy);

router
  .route("/leaders")
  .get(isAuth(USER_ROLE.ADMIN), userController.getAllLeadersWithMembers);

router
  .route("/leaders/:id")
  .get(isAuth(), userController.getLeadersWithMembers);

router
  .route("/:id")
  .get(isAuth(USER_ROLE.ADMIN), userController.getUser)
  .put(isAuth(USER_ROLE.ADMIN), userController.editUser)
  .delete(isAuth(USER_ROLE.ADMIN), userController.deleteUser);

router
  .route("/:id/add-leader")
  .post(
    isAuth(USER_ROLE.ADMIN),
    validationMiddleware.validateMakeLeaderField,
    userController.addToLeader
  );

router
  .route("/:id/update-leader")
  .put(isAuth(USER_ROLE.ADMIN), userController.updateLeader);

router
  .route("/:id/remove-leader")
  .delete(isAuth(USER_ROLE.ADMIN), userController.removeLeader);

module.exports = router;
