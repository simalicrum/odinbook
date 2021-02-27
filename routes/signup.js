var express = require("express");
var router = express.Router();
const multer = require('multer');
const upload = multer({dest: __dirname + '/../public/images'});

const user_controller = require("../controllers/userController");

router.get("/", user_controller.user_signup_get);

router.post("/", upload.single('photo'), user_controller.user_signup_post);

module.exports = router;