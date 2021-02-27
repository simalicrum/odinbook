var express = require('express');
var router = express.Router();
const passport = require('passport');

router.get("/facebook", passport.authenticate("facebook"));

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/posts",
    failureRedirect: "/login",
    scope: "public_profile",
  })
);

module.exports = router;