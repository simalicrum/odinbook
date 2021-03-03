const async = require("async");
const { body, validationResult } = require("express-validator");
var mongoose = require("mongoose");
var htmlentities = require('html-entities');

var Schema = mongoose.Schema;


const Post = require("../models/post");
const User = require("../models/user");

exports.post_detail =  (req, res, next) => {
  Post.findById(req.params.postId)
  .populate("comments")
  .populate("author")
  .populate({path: "comments",
    populate: {
      path: "author"
    }
  })
  .exec((err, post) => {
    if (err) {
      return next(err);
    }
    res.render("post_detail", { post: post, user: req.user });
  });
};

exports.post_list = (req, res, next) => {
  var myselfAndFriends = req.user.friends;
  myselfAndFriends.push(req.user._id);
  Post.find({"author":  { $in: myselfAndFriends}})
    .populate("comments")
    .populate("author")
    .populate("target")
    .populate({path: "comments",
      populate: {
        path: "author"
      }
    })
    .sort("-timestamp")
    .exec( (err, post_list) => {
      if (err) {
        return next(err);
      }
      const post_list_decode = post_list.map(e => { 
        const comments = e.comments.map(f => { 
          console.log("f.content: ", f.content);
          console.log("htmlentities.decode(f.content): ", htmlentities.decode(f.content));
          return {
          author: f.author,
          timestamp: f.timestamp,
          content: htmlentities.decode(f.content),
          post: f.post,
          likes: f.likes,
          _id: f._id
        }});
        return {
        author: e.author,
        timestamp: e.timestamp,
        content: htmlentities.decode(e.content),
        likes: e.likes,
        comments: comments,
        target: e.target,
        id: e._id
      }})
      res.render("post_list", { post_list: post_list_decode, user: req.user});
    });
};

exports.post_create_get =  (req, res, next) => {
  if (req.user !== undefined) {
    res.render("post_form", { title: "Add a post", post: {title: "", content: ""}});
  }
};

exports.post_create_post = [
  body("post", "Post cannot be blank")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    console.log("errors: ", errors);
    if (req.params.id !== undefined) {
      var target = req.params.id;
    } else {
      var target = req.user._id;
    }
    const post = new Post({
      author: req.user._id,
      timestamp: new Date(),
      content: req.body.post,
      likes: [],
      target: target,
      errors: errors,
    });
    if (!errors.isEmpty()) {
      res.render("post_form", {
        post: post,
        title: "Add a post",
        errors: errors.array(),
      });
      return;
    } else {
      post.save( err => {
        if (err) {
          return next(err);
        }
        console.log("req", req);
        res.redirect(req.originalUrl);
      });
    }
  },
];

exports.post_update_get = (req, res, next) => {
  Post.findById(req.params.postId)
    .exec((err, post) => {
      if (err) {
        return next(err);
      }
      if (req.user !== undefined ) {
        if (req.user._id.toString() === post.author._id.toString()) {
          res.render("post_form", {post: post, title: "Edit your post", return_address: req.headers.referer});
        }
      }
    });
};

exports.post_update_post = [
  body("post", "Post cannot be blank")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    console.log("errors: ", errors);
    const post = new Post({
      title: req.body.title,
      author: req.user._id,
      timestamp: new Date(),
      content: req.body.post,
      likes: [],
      errors: errors,
    });
    if (!errors.isEmpty()) {
      res.render("post_form", {
        post: post,
        title: "Add a post",
        errors: errors.array(),
      });
      return;
    } else {
      Post.findOneAndUpdate({_id: req.params.postId}, {
        title: req.body.title,
        author: req.user._id,
        timestamp: new Date(),
        content: req.body.post,
        likes: [],
      } , err => {
        if (err) {
          return next(err);
        }
        res.redirect(req.body.return_address);
      });
    }
  },
];

exports.post_delete_get = (req, res, next) => {
  res.render("post_delete", {title: "This will permanently remove this post. Are you sure?", postId: req.params.postId, return_address: req.headers.referer });
};

exports.post_delete = (req, res, next) => {
  Post.findByIdAndRemove(req.body.postid, function deleteItem(err) {
    if (err) {
      return next(err);
    }
    res.redirect(req.body.return_address);
  });
};

exports.post_like_post = (req, res, next) => {
  Post.findById(req.params.postId)
    .exec((err, post) => {
      if (err) {
        return next(err);
      }
      var likeInLikes = post.likes.includes(req.user._id);
      if (likeInLikes) {
        Post.findByIdAndUpdate(req.params.postId, {$pull: {likes: req.user._id}})
          .exec(err => {
            if (err) {
              return next(err);
            }});
        res.send({likes: post.likes.length - 1});
      } else {
        Post.findByIdAndUpdate(req.params.postId, {$addToSet: {likes: req.user._id}})
        .exec(err => {
          if (err) {
            return next(err);
          }});;
        res.send({likes: post.likes.length + 1});
      }
    })
}