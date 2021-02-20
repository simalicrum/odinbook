const async = require("async");
const { body, validationResult } = require("express-validator");

const Comment = require("../models/comment");
const User = require("../models/user");
const Post = require("../models/post");

exports.comment_detail = (req, res, next) => {
  res.send("NOT IMPLEMENTED: Comment detail GET");
};

exports.comment_list =  (req, res, next) => {
  res.send("NOT IMPLEMENTED: Comment list GET");
};

exports.comment_create_get = (req, res, next) => {
  res.render("comment_form", { title: "Leave a comment", comment: { content: ""} });
};

exports.comment_create_post = [
  body("comment", "Comment cannot be blank")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    console.log("errors: ", errors);
    const comment = new Comment({
      author: req.user._id,
      timestamp: new Date(),
      content: req.body.comment,
      errors: errors,
    });
    if (!errors.isEmpty()) {
      res.render("comment_form", {
        comment: comment,
        title: "Add a comment",
        errors: errors.array(),
      });
      return;
    } else {
      comment.save(err => {
        if (err) {
          return next(err);
        }
        Post.findByIdAndUpdate(req.params.postId, { $addToSet: {comments: [comment._id]}}).exec();
        res.redirect("/posts/" + req.params.postId);
      });
    }
  },
];

exports.comment_update_get = (req, res, next) => {
  Comment.findById(req.params.commentId)
  .exec((err, comment) => {
    if (err) {
      return next(err);
    }
    res.render("comment_form", {comment: comment, title: "Edit your comment", postId: req.params.postId});
  });
};

exports.comment_update_post = [
  body("comment", "Comment cannot be blank")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    console.log("errors: ", errors);
    const comment = new Comment({
      author: req.user._id,
      timestamp: new Date(),
      content: req.body.comment,
      errors: errors,
    });
    if (!errors.isEmpty()) {
      res.render("comment_form", {
        comment: comment,
        title: "Add a comment",
        errors: errors.array(),
      });
      return;
    } else {
      Comment.findOneAndUpdate({_id: req.params.commentId}, {
        author: req.user._id,
        timestamp: new Date(),
        content: req.body.comment,
      } , err => {
        if (err) {
          return next(err);
        }
        res.redirect("/posts/" + req.params.postId + "#comments");
      });
    }
  },
];

exports.comment_delete_get = (req, res, next) => {
  res.render("comment_delete", {title: "This will permanently remove this comment. Are you sure?", commentId: req.params.commentId, postID: req.params.postId });
};

exports.comment_delete = (req, res, next) => {
  Comment.findByIdAndRemove(req.params.commentId, function deleteItem(err) {
    if (err) {
      return next(err);
    }
    res.redirect("/posts/" + req.params.postId);
  });
};
