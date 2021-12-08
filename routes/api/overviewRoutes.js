const router = require("express").Router();

const overviewController = require("../../controllers/overviewController");
const { apiCheckIfAuthenticated } = require("../../controllers/authController");

router.get("/", apiCheckIfAuthenticated, overviewController.getOverview);

module.exports = router;
