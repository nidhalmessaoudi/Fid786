const router = require("express").Router();

const storeController = require("../../controllers/storeController");
const { apiCheckIfAuthenticated } = require("../../controllers/authController");

router.use(apiCheckIfAuthenticated);

router
  .route("/")
  .get(storeController.getStores)
  .post(storeController.createStore);

router
  .route("/:id")
  .get(storeController.getStore)
  .patch(storeController.checkOwnership, storeController.updateStore)
  .delete(storeController.checkOwnership, storeController.deleteStore);

module.exports = router;
