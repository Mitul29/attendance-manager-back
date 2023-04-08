const { Router } = require("express");
const router = Router();

const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const attendanceRoutes = require("./attendanceRoutes");
const errorHandler = require("../middleware/errorMiddleware");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/attendance", attendanceRoutes);

router.use(errorHandler);

module.exports = router;
