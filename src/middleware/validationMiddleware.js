const { body, validationResult, param } = require("express-validator");

const validate = (validations) => async (req, res, next) => {
  try {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length > 0) break;
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        data: null,
        meta: { message: "", error: errors.array()[0].msg, status: 422 },
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports.validateLoginFields = validate([
  body("username", "username is required...").not().isEmpty(),
  body("password", "password is required...").not().isEmpty(),
]);

module.exports.validateAddUserField = validate([
  body("name", "Name is required...").not().isEmpty(),
  body("contact", "contact number is required...")
    .not()
    .isEmpty()
    .isMobilePhone()
    .withMessage("contact number is not in valid format"),
  body("attendanceNo", "Attendance Number is required.")
    .not()
    .isEmpty()
    .isNumeric()
    .withMessage("Invalid Attendance Number"),
]);

module.exports.validateMakeLeaderField = validate([
  param("id", "UserId required...").not().isEmpty(),
  body("username", "Username is required...").not().isEmpty(),
  body("password", "Password is required.").not().isEmpty(),
]);

module.exports.validateAttendanceField = validate([
  body("userId", "UserId required...").not().isEmpty(),
  body("present", "Present Status required...")
    .not()
    .isEmpty()
    .isBoolean()
    .withMessage("Enter Valid status"),
]);
