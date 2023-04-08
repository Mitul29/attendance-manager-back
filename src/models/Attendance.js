const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AttendanceSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    present: { type: Boolean },
    remark: { type: String },
    date: { type: Date },
  },
  { collection: "attendances" }
);

const Attendance = mongoose.model("attendance", AttendanceSchema);

module.exports = Attendance;
