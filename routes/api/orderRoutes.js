const router = require("express").Router();

const orderController = require("../../controllers/orderController");
const { apiCheckIfAuthenticated } = require("../../controllers/authController");

router.use(apiCheckIfAuthenticated);

router
  .route("/")
  .get(orderController.getOrders)
  .post(
    orderController.attachSellerAndBuyer,
    orderController.checkForOrderType,
    orderController.createOrder
  );

router
  .route("/:id")
  .get(orderController.getOrder)
  .patch(orderController.checkOwnership, orderController.updateOrder)
  .delete(orderController.checkOwnership, orderController.deleteOrder);

module.exports = router;
