var express = require('express');
var router = express.Router();

const user_controller = require("../controllers/userController");

/* GET users listing. */
router.get('/', user_controller.user_list);

router.get("/new", user_controller.user_signup_get);

router.post("/new", user_controller.user_signup_post);

router.get("/:id/edit", user_controller.user_update_get);

router.put("/:id/edit", user_controller.user_update_post);

router.delete("/:id/delete", user_controller.user_delete_get);

router.delete("/:id/delete", user_controller.user_delete);

module.exports = router;