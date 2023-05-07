const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const generalResponse = require("../helper/commonHelper");
const { User, USER_ROLE } = require("../models/User");
const HttpException = require("../exceptions/HttpException");

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

const getUsersHierarchy = async (req, res, next) => {
  try {
    const users = await User.aggregate([
      { $match: { role: { $eq: USER_ROLE.LEADER } } },
      {
        $graphLookup: {
          from: "users",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "assignTo",
          as: "children",
          maxDepth: 4,
          depthField: "level",
        },
      },
      {
        $addFields: {
          level: {
            $reduce: {
              input: "$children",
              initialValue: "$price",
              in: { $multiply: ["$$value", { $subtract: [1, "$$this"] }] },
            },
          },
          children: {
            $reduce: {
              input: "$children",
              initialValue: {
                currentLevel: -1,
                currentLevelChildren: [],
                previousLevelChildren: [],
              },
              in: {
                $let: {
                  vars: {
                    prev: {
                      $cond: [
                        { $eq: ["$$value.currentLevel", "$$this.level"] },
                        "$$value.previousLevelChildren",
                        "$$value.currentLevelChildren",
                      ],
                    },
                    current: {
                      $cond: [
                        { $eq: ["$$value.currentLevel", "$$this.level"] },
                        "$$value.currentLevelChildren",
                        [],
                      ],
                    },
                  },
                  in: {
                    currentLevel: "$$this.level",
                    previousLevelChildren: "$$prev",
                    currentLevelChildren: {
                      $concatArrays: [
                        "$$current",
                        [
                          {
                            $mergeObjects: [
                              "$$this",
                              {
                                children: {
                                  $filter: {
                                    input: "$$prev",
                                    as: "e",
                                    cond: {
                                      $eq: ["$$e.assignTo", "$$this._id"],
                                    },
                                  },
                                },
                              },
                            ],
                          },
                        ],
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          children: "$children.currentLevelChildren",
        },
      },
    ]);

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

const getLeaderWithMembers = async (req, res, next) => {
  try {
    const { id } = req.params;

    const leader = await User.findOne({ _id: id, role: USER_ROLE.LEADER });

    if (!leader) {
      throw new HttpException(400, "Invalid LeaderId");
    }

    const assignedMembers = await User.find({ assignTo: leader._id });
    const allAssignedMembersWithChild = [];
    for (const subLeader of assignedMembers) {
      const allMembers = await User.find({ assignTo: subLeader._id });
      allAssignedMembersWithChild.push({
        ...subLeader.toObject(),
        assignedMembers: allMembers,
      });
    }

    const userWithMember = {
      ...leader.toObject(),
      assignedMembers: allAssignedMembersWithChild,
    };

    generalResponse(res, userWithMember);
  } catch (error) {
    next(error);
  }
};

const getLeaderChildren = async (req, res, next) => {
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
      throw new HttpException(400, "Not able to assign self");
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
      throw new HttpException(400, "User not found");
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
      throw new HttpException(400, "Invalid UserID");
    }

    const userNameExist = await User.findOne({ username });
    if (userNameExist) {
      throw new HttpException(400, "Username already exist");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log("HELLLO BRO");

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
      throw new HttpException(400, "Invalid UserId");
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
      throw new HttpException(400, "Invalid UserId");
    }

    if (!username && !password) {
      throw new HttpException(400, "Username or Password required.");
    }

    if (username && user.username !== username) {
      const userNameExist = await User.findOne({ username });
      if (userNameExist) {
        throw new HttpException(400, "Username Already Exist");
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
  getUsersHierarchy,
  getAllLeadersWithMembers,
  getLeaderWithMembers,
  getLeaderChildren,
  getUser,
  addUser,
  editUser,
  deleteUser,
  addToLeader,
  updateLeader,
  removeLeader,
};
