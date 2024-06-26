const { startOfDay, endOfDay } = require("date-fns");
const { isValidObjectId } = require("mongoose");

const { User, USER_ROLE } = require("../models/User");
const Attendance = require("../models/Attendance");

const generalResponse = require("../helper/commonHelper");
const HttpException = require("../exceptions/HttpException");

const addAttendance = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { userId, present, remark = "", date = new Date() } = req.body;

    const TODAY = startOfDay(new Date(date));
    // const TODAY = new Date(date);

    if (!isValidObjectId(userId)) {
      throw new HttpException(400, "Invalid UserId");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new HttpException(400, "Invalid UserId");
    }

    if (user.assignTo.toString() !== currentUser._id.toString()) {
      throw new HttpException(400, "You are not leader of this user");
    }

    const attendance = await Attendance.findOne({ userId, date: TODAY });

    if (attendance) {
      attendance.present = present;
      attendance.remark = remark;
      await attendance.save();

      return generalResponse(
        res,
        attendance,
        "Attendance Updated Successfully..."
      );
    }

    const newAttendance = new Attendance({
      userId: userId,
      present: present,
      date: TODAY,
      remark: remark,
    });

    await newAttendance.save();

    return generalResponse(
      res,
      newAttendance,
      "Attendance Added Successfully..."
    );
  } catch (error) {
    next(error);
  }
};

const getMembersAttendance = async (req, res, next) => {
  try {
    const { leaderId } = req.params;
    const { date = new Date() } = req.query;

    const TODAY = startOfDay(new Date(date));

    if (!isValidObjectId(leaderId)) {
      throw new HttpException(400, "Invalid LeaderId");
    }

    const members = await User.find({ assignTo: leaderId });

    const allMembers = [];

    for (const member of members) {
      const attendance = await Attendance.findOne({
        date: TODAY,
        userId: member._id,
      });
      allMembers.push({ ...member.toObject(), attendance });
    }

    return generalResponse(
      res,
      allMembers,
      "Attendance Fetched Successfully..."
    );
  } catch (error) {
    next(error);
  }
};

const getMembersAttendanceWithFilter = async (req, res, next) => {
  try {
    const {
      leaderId,
      dateFrom = new Date(),
      dateTo = new Date(),
      search = "",
    } = req.body;

    const where = {
      role: { $ne: USER_ROLE.ADMIN },
      ...(leaderId && { assignTo: leaderId }),
      ...(search && { name: { $regex: new RegExp(search, "i") } }),
    };

    const DATE_FROM = startOfDay(new Date(dateFrom));
    const DATE_TO = endOfDay(new Date(dateTo));

    if (leaderId && !isValidObjectId(leaderId)) {
      throw new HttpException(400, "Invalid LeaderId");
    }

    const members = await User.find(where);

    const allMembers = [];

    for (const member of members) {
      const attendance = await Attendance.find({
        date: { $gte: DATE_FROM, $lte: DATE_TO },
        userId: member._id,
      });
      allMembers.push({ ...member.toObject(), attendance });
    }

    return generalResponse(
      res,
      allMembers,
      "Attendance Fetched Successfully..."
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addAttendance,
  getMembersAttendance,
  getMembersAttendanceWithFilter,
};
