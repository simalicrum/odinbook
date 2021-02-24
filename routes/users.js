var express = require('express');
var router = express.Router();
const passport = require('passport');

const user_controller = require("../controllers/userController");
const post_controller = require("../controllers/postController");

/* GET users listing. */
router.get('/', user_controller.user_list);

router.get("/:id", passport.authenticate('jwt', {session: false}), user_controller.user_detail_get);

router.post("/:id", passport.authenticate('jwt', {session: false}), post_controller.post_create_post);

router.get("/:id/edit", passport.authenticate('jwt', {session: false}), user_controller.user_update_get);

router.put("/:id/edit", passport.authenticate('jwt', {session: false}), user_controller.user_update_post);

router.delete("/:id/delete", passport.authenticate('jwt', {session: false}), user_controller.user_delete_get);

router.delete("/:id/delete", passport.authenticate('jwt', {session: false}), user_controller.user_delete);

router.get("/:id/friends", passport.authenticate('jwt', {session: false}), user_controller.user_friends_get);

module.exports = router;