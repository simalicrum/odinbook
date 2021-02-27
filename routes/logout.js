var express = require("express");
var router = express.Router();
const passport = require('passport');

const user_controller = require("../controllers/userController");

const jwtSettings = {session: false, failureRedirect: "/login"}

router.get("/", passport.authenticate('jwt', jwtSettings), user_controller.user_logout_get);

module.exports = router;