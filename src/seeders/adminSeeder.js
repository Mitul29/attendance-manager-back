const { User, USER_ROLE } = require("../models/User");
const connectDB = require("../config/db");

const addAppAdmin = async () => {
  try {
    await connectDB();

    const adminUser = new User({
      username: "admin",
      password: "$2a$10$SNHX/GIU.NEjc35uTe/dzODJp.tHt08qgeEQkoabhelukBUWtVO5y",
      role: USER_ROLE.ADMIN,
    });
    await adminUser.save();

    console.log("Admin Registered Successfully");
  } catch (error) {
    console.log("Error Add Admin", error);
  }
};

addAppAdmin();
