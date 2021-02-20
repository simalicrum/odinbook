var mongoose = require("mongoose");
const { DateTime } = require("luxon");

var Schema = mongoose.Schema;

var CommentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: "User"},
  timestamp: { type: Date },
  content: { type: String },
  post: { type: Schema.Types.ObjectId, ref: "Post"},
});

CommentSchema.virtual("timestamp_formatted").get(function () {
  return this.timestamp ? DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATETIME_MED) : ""
});

module.exports = mongoose.model("Comment", CommentSchema);