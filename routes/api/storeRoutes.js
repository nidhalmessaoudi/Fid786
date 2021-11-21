const router = require("express").Router();

const { apiCheckIfAuthenticated } = require("../../controllers/authController");
const storeController = require("../../controllers/storeController");

router
  .route("/")
  .get(storeController.getStores)
  .post(apiCheckIfAuthenticated, storeController.createStore);

router
  .route("/:id")
  .get(storeController.getStore)
  .patch(apiCheckIfAuthenticated, storeController.updateStore)
  .delete(apiCheckIfAuthenticated, storeController.deleteStore);

module.exports = router;
