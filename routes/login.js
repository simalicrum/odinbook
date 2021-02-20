var express = require("express");
var router = express.Router();
const User = require("../models/user");

const user_controller = require("../controllers/userController");

router.get("/", user_controller.user_login_get);

router.post("/", user_controller.user_login_post);

module.exports = router;