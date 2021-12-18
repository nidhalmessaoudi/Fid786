const router = require("express").Router();

const homeController = require("../../controllers/homeController");

router.get("/", homeController.getHome);
router.get("/terms", homeController.getTerms);

module.exports = router;
