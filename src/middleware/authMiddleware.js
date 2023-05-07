const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const { USER_ROLE, User } = require("../models/User");
const HttpException = require("../exceptions/HttpException");

const isAuth = (role = USER_ROLE.LEADER) => {
  return async (req, res, next) => {
    /* Verify token */
    try {
      const token = req.header("Authorization")?.split(" ")[1];

      if (!token) {
        res.status(401).json({ msg: "No token, Authorization failed" });
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      const decodedUser = decoded.user;

      const user = await User.findById(decodedUser.id);

      if (!user) {
        throw new HttpException(401, "Token is not Valid");
      }

      if (user.role !== USER_ROLE.ADMIN && user.role !== role) {
        throw new HttpException(401, "You are not authorized");
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error.message);
      res.status(401);
      next(error);
    }
  };
};

module.exports = isAuth;
