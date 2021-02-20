var express = require('express');
var router = express.Router();

const post_controller = require("../controllers/postController");
const comment_controller = require("../controllers/commentController");
const passport = require('passport');

const jwtGetUser = (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if (!user) {
      return next();
    }
    req.login(user, { session: false }, (err) => {
      return next();
    } )
  })(req, res, next)
}

router.get('/', (req, res, next) => {jwtGetUser(req, res, next)}, post_controller.post_list);

router.get("/new", passport.authenticate('jwt', {session: false}), post_controller.post_create_get);

router.post("/new", passport.authenticate('jwt', {session: false}), post_controller.post_create_post);

router.get("/:postId", (req, res, next) => {jwtGetUser(req, res, next)}, post_controller.post_detail);

router.get("/:postId/edit", passport.authenticate('jwt', {session: false}), post_controller.post_update_get);

router.post("/:postId/edit", passport.authenticate('jwt', {session: false}), post_controller.post_update_post);

router.get("/:postId/delete", passport.authenticate('jwt', {session: false}), post_controller.post_delete_get);

router.post("/:postId/delete", passport.authenticate('jwt', {session: false}), post_controller.post_delete);

//Post comment routes
router.get('/:postId/comments', (req, res, next) => {jwtGetUser(req, res, next)}, comment_controller.comment_list);

router.get("/:postId/comments/new", passport.authenticate('jwt', {session: false}), comment_controller.comment_create_get);

router.post("/:postId/comments/new", passport.authenticate('jwt', {session: false}), comment_controller.comment_create_post);

router.get("/:postId/comments/:commentId", (req, res, next) => {jwtGetUser(req, res, next)}, comment_controller.comment_detail);

router.get("/:postId/comments/:commentId/edit", passport.authenticate('jwt', {session: false}), comment_controller.comment_update_get);

router.post("/:postId/comments/:commentId/edit", passport.authenticate('jwt', {session: false}), comment_controller.comment_update_post);

router.get("/:postId/comments/:commentId/delete", passport.authenticate('jwt', {session: false}), comment_controller.comment_delete_get);

router.post("/:postId/comments/:commentId/delete", passport.authenticate('jwt', {session: false}), comment_controller.comment_delete);

module.exports = router;