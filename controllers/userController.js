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
var fs = require('fs');
var path = require('path');
var htmlentities = require('html-entities');

exports.user_login_get = (req, res, next) => {
  res.render("login_form", { title: "Login" });
};

exports.user_login_post = (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, message) => {
    if (err) {
      return next(err);
    }
    console.log("You shouldn't be seeing a message: ", message);
    console.log("user: ", user);
    if (!user) {
      return res.status(400).render("login_form", message);
    }
    req.login(user, { session: false }, (err) => {
      if (err) return next(err);
      const payload = {
        username: user.username,
        status: user.status
      };
      const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "1d" });
      res.cookie("token", token, { httpOnly: true, secure: false, maxAge: 3600000 });
      res.redirect("/posts");
      res.send();
    });
  })(req, res, next);
}

exports.facebook_login = (req, res, next) => {
  passport.authenticate("facebook", {session: false}, (err, user, info) => {
    if (err) return next(err);
    const payload = {
      username: user.username,
      status: user.status
    };
    const token = jwt.sign(payload, process.env.SECRET, { expiresIn: "1d" });
    res.cookie("token", token, { httpOnly: true, secure: false, maxAge: 3600000 });
    res.redirect("/posts");
    res.send();
  })(req, res, next);
}

exports.user_logout_get = (req, res) => {
  res.clearCookie("token");
  res.redirect("/posts");
};

exports.user_list = (req, res, next) => {
  User.find({$or: [{_id: { $ne: req.user._id }}]})
    .exec((err, user_list) => {
      if (err) {
        return next(err);
      }
      res.render("user_list", { user_list: user_list, user: req.user });
      }
    )
}

exports.user_signup_get = (req, res, next) => {
  res.render("signup_form", { title: "Create an account", return_address: req.headers.referer });
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
      if (!req.file) {
        var picture = "user-placeholder.svg";
      } else {
        var picture = "profile/" + req.file.filename;
      }
      const user = new User({
        first_name: req.body.firstname,
        last_name: req.body.lastname,
        username: req.body.username,
        password: hashedPassword,
        status: "user",
        friends: [],
        friend_requests: [],
        picture: picture,
        image: {
          data: fs.readFileSync(path.join(__dirname + '/../public/images/' + picture)),
          contentType: 'image/png'
        },
        location: req.body.location,
        birthday: req.body.dob,
        facebookId: req.body.facebookId
      });
      if (!errors.isEmpty()) {
        console.log("errors: ", errors.array());
        res.render("signup_form", {
          user: user,
          title: "Create an account",
          errors: errors.array(),
          return_address: req.headers.referer,
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
      const post_list_decode = results.post_list.map(e => { 
        const comments = e.comments.map(f => { 
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
        _id: e._id
      }})
      res.render("user_detail", { user_info: results.user_info, post_list: post_list_decode, user: req.user});
    }
  )
};

exports.user_update_get = (req, res, next) => {
  User.findById(req.user._id)
    .exec((err, post) => {
      if (err) {
        return next(err);
      }
      res.render("user_form", {user: req.user, title: "Edit your profile", return_address: req.headers.referer});
    });
};

exports.user_update_post = [
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
  (req, res, next) => {
    const errors = validationResult(req);
    const user = new User({
      first_name: req.body.firstname,
      last_name: req.body.lastname,
      username: req.body.username,
      status: "user",
      friends: [],
      friend_requests: [],
      picture: req.user.picture,
      location: req.body.location,
      birthday: req.body.dob,
      facebookId: req.body.facebookId
    });
    if (!errors.isEmpty()) {
      console.log("errors: ", errors.array());
      res.render("user_form", {
        user: user,
        title: "Edit your profile",
        errors: errors.array(),
        return_address: req.headers.referer,
      });
      return;
    } else {
      User.findOneAndUpdate( {_id: req.user._id}, {
        first_name: req.body.firstname,
        last_name: req.body.lastname,
        username: req.body.username,
        status: "user",
        friends: [],
        friend_requests: [],
        picture: req.user.picture,
        location: req.body.location,
        birthday: req.body.dob,
        facebookId: req.body.facebookId
      }, err => {
        if (err) {
          return next(err);
        }
        res.redirect("/users/" + req.user._id);
      });
    }
  },
];

exports.user_delete_get = (req, res, next) => {
  res.send("NOT IMPLEMENTED: User delete GET");
};

exports.user_delete = (req, res, next) => {
  res.send("NOT IMPLEMENTED: User DELETE");
};

exports.user_friends_get = (req, res, next) => {
  User.findById(req.params.id)
    .populate("friends")
    .exec((err, user) => {
      if (err) {
        return next(err);
      }
      res.render("friend_list", { friend_list: user.friends, user: req.user, id: req.params.id });
      }
    )
}

exports.user_addfriend_get = (req, res, next) => {
  User.findById(req.params.addID)
    .exec((err, friendadd) => {
      if (err) {
        return next(err);
      }
      res.render("friend_add", { friendadd: friendadd, user: req.user });
    })
};

exports.user_addfriend_post = (req, res, next) => {
  User.findByIdAndUpdate( req.body.friendaddid, { $addToSet: { friend_requests: [req.user._id]}
  }, err => {
    if (err) {
      return next(err);
    }
    res.redirect("/posts");
  })
};


exports.user_requests_get = (req, res, next) => {
  User.findById(req.user._id)
    .populate("friend_requests")
    .exec((err, user) => {
      if (err) {
        return next(err);
      }
      res.render("request_list", { request_list: user.friend_requests, user: req.user });
      }
    )
};

exports.user_requests_post = (req, res, next) => {
  async.parallel([
    cb => {
      User.findByIdAndUpdate( req.body.requestid, { $addToSet: { friends: [req.user._id]}})
        .exec(cb);
    },
    cb => {
      User.findByIdAndUpdate( req.user._id, { $addToSet: { friends: [req.body.requestid]}})
        .exec(cb);
    },
    cb => {
      User.findByIdAndUpdate( req.user._id, { $pull: { friend_requests: req.body.requestid}})
        .exec(cb);
    }
    ,
    cb => {
      User.findByIdAndUpdate( req.body.requestid, { $pull: { friend_requests: req.user._id}})
        .exec(cb);
    }
  ],err => {
    if (err) {
      return next(err);
    }
    res.redirect("/posts");
  })
};
