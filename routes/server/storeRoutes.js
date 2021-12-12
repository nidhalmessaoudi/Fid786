const router = require("express").Router();

const storeController = require("../../controllers/storeController");

router.get("/:store", storeController.getOne);

module.exports = router;
