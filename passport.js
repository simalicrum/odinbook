const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const jwt = require('jsonwebtoken');
const passportJWT = require("passport-jwt");
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const bcrypt = require("bcryptjs");

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
      console.log("jwt did something: ", user);
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
