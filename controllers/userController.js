const async = require("async");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require("mongoose");
const User = require("../models/user");
const Post = require("../models/post")
const { deleteOne } = require("../models/user");

exports.user_login_get = (req, res, next) => {
  res.render("login_form", { title: "Login" });
};

exports.user_login_post = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, message) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(400).send({ ...message });
    }
    req.login(user, { session: false }, (err) => {
      if (err) return next(err);
      const payload = {
        username: user.username,
        status: user.status
      };
      // generate a signed json web token with contents of user object and return in res
      const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "1d" });
      res.cookie("token", token, { httpOnly: true, secure: false, maxAge: 3600000 });
      res.redirect("/posts");
      res.send();
    });
  })(req, res, next);
}

exports.user_logout_get = (req, res) => {
  res.clearCookie("token");
  res.redirect("/posts");
};

exports.user_list = (req, res, next) => {
  User.find()
    .exec((err, user_list) => {
      if (err) {
        return next(err);
      }
      console.log("req.user: ", req.user);
      console.log("user_list: ", user_list);
      res.render("user_list", { user_list: user_list, user: req.user });
      }
    )
}

exports.user_signup_get = (req, res, next) => {
  res.render("signup_form", { title: "Create an account" });
};

exports.user_signup_post = [
  body("firstname", "First name cannot be blank")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("lastname", "Last name cannot be blank")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("username", "Username cannot be blank")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("password", "Password cannot be blank")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      if (err) {
        return next(err);
      }
      const user = new User({
        first_name: req.body.firstname,
        last_name: req.body.lastname,
        username: req.body.username,
        password: hashedPassword,
        status: "user",
        friends: [],
        friend_requests: [],
        picture: "rob.jpg",
        location: req.body.location,
        birthday: req.body.dob,
      });
      if (!errors.isEmpty()) {
        console.log("errors: ", errors.array());
        res.render("signup_form", {
          user: user,
          title: "Create an account",
          errors: errors.array(),
        });
        return;
      } else {
        user.save( err => {
          if (err) {
            return next(err);
          }
          res.redirect("/");
        });
      }
    });
  },
];

exports.user_detail_get = (req, res, next) => {
  async.parallel( 
    {
      user_info: cb => {
        User.findById(req.params.id)
          .populate("friends")
          .populate("friend_requests")
          .exec(cb)
      },
      post_list: cb => {
        Post.find({$or: [{author: req.params.id}, {target: req.params.id}]})
        .populate("comments")
        .populate("author")
        .populate("target")
        .populate({path: "comments",
          populate: {
            path: "author"
          }
        })
        .sort("-timestamp")
        .exec(cb)
      }
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("user_detail", { user_info: results.user_info, post_list: results.post_list, user: req.user  });
    }
  )
};

exports.user_update_get = (req, res, next) => {
  res.send("NOT IMPLEMENTED: User update GET");
};

exports.user_update_post = (req, res, next) => {
  res.send("NOT IMPLEMENTED: User update POST");
};

exports.user_delete_get = (req, res, next) => {
  res.send("NOT IMPLEMENTED: User delete GET");
};

exports.user_delete = (req, res, next) => {
  res.send("NOT IMPLEMENTED: User DELETE");
};

exports.user_friends_get = (req, res, next) => {
  console.log("req.user.friends: ", req.user.friends);
  User.findById(req.user.friends)
    .exec((err, user_list) => {
      if (err) {
        return next(err);
      }
      console.log("user_list: ", user_list);
      res.render("friend_list", { user_list: user_list, user: req.user });
      }
    )
}