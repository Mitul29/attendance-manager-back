const { Router } = require("express");
const isAuth = require("../middleware/authMiddleware");

const validationMiddleware = require("../middleware/validationMiddleware");
const attendanceController = require("../controllers/attendanceController");

const router = Router();

router.post(
  "/",
  [isAuth(), validationMiddleware.validateAttendanceField],
  attendanceController.addAttendance
);

router.get("/:leaderId", [isAuth()], attendanceController.getMembersAttendance);

router.post(
  "/getAll",
  [isAuth()],
  attendanceController.getMembersAttendanceWithFilter
);

module.exports = router;
