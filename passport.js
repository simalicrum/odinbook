const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const jwt = require('jsonwebtoken');
const passportJWT = require("passport-jwt");
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const bcrypt = require("bcryptjs");
const FacebookStrategy = require('passport-facebook').Strategy;
var express = require("express");
var app = express();


const User = require("./models/user");

// Login setup
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // passwords match! log user in
          console.log("login worked");
          return done(null, user);
        } else {
          // passwords do not match!
          return done(null, false, { message: "Incorrect password" });
        }
      });
    });
  })
);

var cookieExtractor = req => {
  var token = null;
  if (req && req.cookies) {
      token = req.cookies['token'];
  }
  return token;
};

passport.use(
  new JwtStrategy(
    {
      secretOrKey: process.env.SECRET,
      jwtFromRequest: cookieExtractor,
    }, (payload, done) => {
    User.findOne({username: payload.username}, (err, user) => {
      if (err) {
          return done(err, false);
      }
      if (user) {
          return done(null, user);
      } else {
          return done(null, false);
      }
  });
  })
);

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:3000/auth/facebook/callback",
  profileFields: ["first_name", "last_name", "picture.type(large)"],
},
(accessToken, refreshToken, profile, done) => {
  User.findOne({facebookId: profile.id}).exec((err, result) => {
    console.log("result: ", result);
    if (!result) {
      var user = new User({
        first_name: profile.name.givenName,
        last_name: profile.name.familyName,
        username: "",
        password: "",
        status: "user",
        friends: [],
        friend_requests: [],
        picture: "user-placeholder.svg",
        facebookId: profile.id
      });
      user.save( err => {
        if (err) {
          return next(err);
        }
        done(null, user);
      });
    } else {
      console.log("found the facebook user");
      var user = result;
      done(null, user);
    }
  });
}
));