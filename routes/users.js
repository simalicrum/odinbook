var express = require('express');
var router = express.Router();
const passport = require('passport');

const user_controller = require("../controllers/userController");

/* GET users listing. */
router.get('/', user_controller.user_list);

router.get("/:id", passport.authenticate('jwt', {session: false}), user_controller.user_detail_get);

router.get("/:id/edit", passport.authenticate('jwt', {session: false}), user_controller.user_update_get);

router.put("/:id/edit", passport.authenticate('jwt', {session: false}), user_controller.user_update_post);

router.delete("/:id/delete", passport.authenticate('jwt', {session: false}), user_controller.user_delete_get);

router.delete("/:id/delete", passport.authenticate('jwt', {session: false}), user_controller.user_delete);

module.exports = router;