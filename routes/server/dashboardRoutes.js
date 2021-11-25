const router = require("express").Router();

const dashboardController = require("../../controllers/dashboardController");
const { checkIfAuthenticated } = require("../../controllers/authController");

router.get(
  "/dashboard",
  checkIfAuthenticated,
  dashboardController.getDashboard
);

module.exports = router;
