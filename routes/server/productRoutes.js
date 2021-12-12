const router = require("express").Router();

const productController = require("../../controllers/productController");

router.get("/:store/:productId", productController.getOne);

module.exports = router;
