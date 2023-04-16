const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const { User } = require("../models/User");
const { JWT_SECRET } = require("../config");
const generalResponse = require("../helper/commonHelper");

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      res.status(400);
      throw new Error("Invalid Credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400);
      throw new Error("Invalid Credentials");
    }

    const expiresIn = "30d";
    const payload = { user: { id: user._id } };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn });

    return generalResponse(res, { token, user }, "Login Success");
  } catch (error) {
    next(error);
  }
};

const getLoggedIn = async (req, res, next) => {
  try {
    const loggedInUser = req.user;
    if (!loggedInUser) {
      res.status(401);
      throw new Error("Your Session was Expired");
    }

    generalResponse(res, loggedInUser);
  } catch (error) {
    next(error);
  }
};

module.exports = { login, getLoggedIn };
