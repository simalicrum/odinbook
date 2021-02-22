var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  first_name: {type: String},
  last_name: {type: String},
  username: {type: String},
  password: {type: String},
  status: {type: String},
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  friend_requests: [{ type: Schema.Types.ObjectId, ref: "User" }],
  picture: "",
});

UserSchema.virtual("url").get(function () {
  return "/user/" + this._id;
});

module.exports = mongoose.model("User", UserSchema);