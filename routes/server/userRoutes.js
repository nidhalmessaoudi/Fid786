const router = require("express").Router();

const userController = require("../../controllers/userController");

router
  .route("/signup")
  .get(userController.getSignup)
  .post(userController.postSignup);

router
  .route("/login")
  .get(userController.getLogin)
  .post(userController.postLogin);

module.exports = router;
