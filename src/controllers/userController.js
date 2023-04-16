const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const generalResponse = require("../helper/commonHelper");
const { User, USER_ROLE } = require("../models/User");

const ObjectId = mongoose.Types.ObjectId;

const getAllUsers = async (req, res, next) => {
  try {
    const { search = "", unAssigned, isLeader, isMember } = req.query;

    const where = {
      role: { $ne: USER_ROLE.ADMIN },
      ...(search && { fullName: { $regex: new RegExp(search, "i") } }),
      ...(unAssigned && { assignTo: null }),
      ...(isLeader && { role: USER_ROLE.LEADER }),
      ...(isMember && { role: USER_ROLE.MEMBER }),
    };

    const users = await User.find(where);

    generalResponse(res, users);
  } catch (error) {
    next(error);
  }
};

const getAllLeadersWithMembers = async (req, res, next) => {
  try {
    const { search = "" } = req.query;

    const where = {
      role: USER_ROLE.LEADER,
      ...(search && { fullName: { $regex: new RegExp(search, "i") } }),
    };

    const allLeaders = [];

    const users = await User.find(where);

    for (const user of users) {
      const allMembers = await User.find({ assignTo: user._id });
      allLeaders.push({ ...user.toObject(), assignedMembers: allMembers });
    }

    generalResponse(res, allLeaders);
  } catch (error) {
    next(error);
  }
};

const getLeadersWithMembers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { search } = req.query;

    const allAssignedMembers = await User.find({
      assignTo: new ObjectId(id),
      ...(search && { fullName: { $regex: new RegExp(search, "i") } }),
    });

    generalResponse(res, allAssignedMembers);
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

const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    return generalResponse(res, user, "User Fetched Successfully");
  } catch (error) {
    next(error);
  }
};

const editUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, contact, attendanceNo, address, assignTo } = req.body;

    const updateFields = {};

    if (assignTo !== undefined && assignTo === id) {
      throw new Error("Not able to assign self");
    }

    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (contact !== undefined) updateFields.contact = contact;
    if (attendanceNo !== undefined) updateFields.attendanceNo = attendanceNo;
    if (address !== undefined) updateFields.address = address;
    if (assignTo !== undefined) updateFields.assignTo = assignTo;

    const user = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

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

const addToLeader = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;

    const user = await User.findById(new ObjectId(id));
    if (!user) {
      throw new Error("Invalid UserID");
    }

    const userNameExist = await User.findOne({ username });
    if (userNameExist) {
      throw new Error("Username already exist");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const leader = await User.findByIdAndUpdate(
      id,
      { $set: { username, password: hashedPassword, role: USER_ROLE.LEADER } },
      { new: true }
    );

    generalResponse(res, leader, "Added To Leader Successfully");
  } catch (error) {
    next(error);
  }
};
const removeLeader = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      _id: new ObjectId(id),
      role: USER_ROLE.LEADER,
    });
    if (!user) {
      throw new Error("Invalid UserId");
    }

    const leader = await User.findByIdAndUpdate(id, {
      $set: { username: null, password: null, role: USER_ROLE.MEMBER },
    });

    await User.updateMany(
      { assignTo: new ObjectId(id) },
      { $set: { assignTo: null } }
    );

    generalResponse(res, leader, "Removed from Leader Successfully");
  } catch (error) {
    next(error);
  }
};

const updateLeader = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;

    const user = await User.findOne({
      _id: new ObjectId(id),
      role: USER_ROLE.LEADER,
    });

    if (!user) {
      throw new Error("Invalid UserId");
    }

    if (!username && !password) {
      throw new Error("Username or Password required.");
    }

    if (username && user.username !== username) {
      const userNameExist = await User.findOne({ username });
      if (userNameExist) {
        throw new Error("Username Already Exist");
      }
      user.username = username;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    await user.save();

    return generalResponse(res, user, "Leader Updated Successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getAllLeadersWithMembers,
  getLeadersWithMembers,
  getUser,
  addUser,
  editUser,
  deleteUser,
  addToLeader,
  updateLeader,
  removeLeader,
};
