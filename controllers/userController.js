const async = require("async");
const { body, validationResult } = require("express-validator");
const passport = require("passport");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const express = require('express');

const User = require("../models/user");
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
      res.redirect("/");
      res.send();
    });
  })(req, res, next);
}

exports.user_logout_get = (req, res) => {
  res.clearCookie("token");
  res.redirect("/posts");
};

exports.user_list = (res, req, next) => {
  res.send("NOT IMPLEMENTED: User list GET");
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