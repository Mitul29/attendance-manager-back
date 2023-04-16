const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const USER_ROLE = {
  ADMIN: "admin",
  LEADER: "leader",
  MEMBER: "member",
};

const UserSchema = new Schema(
  {
    username: { type: String },
    password: { type: String },
    name: { type: String },
    email: { type: String },
    contact: { type: String },
    attendanceNo: { type: Number },
    address: { type: String },
    assignTo: { type: Schema.Types.ObjectId, ref: "user", default: null },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.MEMBER,
    },
  },
  { collection: "users" }
);

const User = mongoose.model("user", UserSchema);

module.exports = { User, USER_ROLE };
