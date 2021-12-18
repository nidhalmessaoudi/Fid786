const router = require("express").Router();

const orderController = require("../../controllers/orderController");
const { checkIfAuthenticated } = require("../../controllers/authController");

router.get("/", checkIfAuthenticated, orderController.getUserOrders);

module.exports = router;
