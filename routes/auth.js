var express = require('express');
var router = express.Router();
const passport = require('passport');

const user_controller = require("../controllers/userController");

router.get("/facebook", passport.authenticate("facebook", {session: false}));

router.get(
  "/facebook/callback", user_controller.facebook_login
);

module.exports = router;