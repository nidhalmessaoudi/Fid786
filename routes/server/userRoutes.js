const router = require("express").Router();

const userController = require("../../controllers/userController");

router
  .route("/register")
  .get(userController.getRegister)
  .post(userController.postRegister);

router
  .route("/login")
  .get(userController.getLogin)
  .post(userController.postLogin);

router.get("/logout", userController.getLogout);

module.exports = router;
