const router = require("express").Router();

const orderController = require("../../controllers/orderController");

router
  .route("/")
  .get(orderController.getOrders)
  .post(orderController.attachSellerAndBuyer, orderController.createOrder);

router
  .route("/:id")
  .get(orderController.getOrder)
  .patch(orderController.updateOrder)
  .delete(orderController.deleteOrder);

module.exports = router;
