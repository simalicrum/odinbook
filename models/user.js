var mongoose = require("mongoose");
const { DateTime } = require("luxon");

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  first_name: {type: String},
  last_name: {type: String},
  username: {type: String},
  password: {type: String},
  status: {type: String},
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  friend_requests: [{ type: Schema.Types.ObjectId, ref: "User" }],
  picture: {type: String},
  location: {type: String},
  birthday: {type: Date},
  facebookId: {type: String},
});

UserSchema.virtual("url").get(function () {
  return "/user/" + this._id;
});

UserSchema.virtual("birthday_formatted").get(function () {
  return this.birthday ? DateTime.fromJSDate(this.birthday).toLocaleString(DateTime.DATETIME_MED) : ""
});

module.exports = mongoose.model("User", UserSchema);