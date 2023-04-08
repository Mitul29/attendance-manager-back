const generalResponse = require("../helper/commonHelper");
const { User, USER_ROLE } = require("../models/User");

const getAllUsers = async (req, res, next) => {
  try {
    const search = req.query.search || "";

    const where = {
      role: { $ne: USER_ROLE.ADMIN },
      ...(search && { fullName: { $regex: new RegExp(search, "i") } }),
    };

    const users = await User.find(where);

    generalResponse(res, users);
  } catch (error) {
    next(error);
  }
};

const addUser = async (req, res, next) => {
  try {
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      contact: req.body.contact,
      attendanceNo: req.body.attendanceNo,
      address: req.body.address,
      assignTo: req.body.assignTo,
    });

    await user.save();

    return generalResponse(res, user, "User Created Successfully");
  } catch (error) {
    next(error);
  }
};

const editUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, contact, attendanceNo, address, assignTo } = req.body;

    const updateFields = {};

    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (contact !== undefined) updateFields.contact = contact;
    if (attendanceNo !== undefined) updateFields.attendanceNo = attendanceNo;
    if (address !== undefined) updateFields.address = address;
    if (assignTo !== undefined) updateFields.assignTo = assignTo;

    const user = await User.findByIdAndUpdate(id, updateFields, { new: true });

    return generalResponse(res, user, "User Updated Successfully");
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndRemove(id);
    if (!user) {
      throw new Error("User not found");
    }

    return generalResponse(res, user, "User Deleted Successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, addUser, editUser, deleteUser };
