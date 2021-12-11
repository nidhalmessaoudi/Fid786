const router = require("express").Router();

const { apiCheckIfAuthenticated } = require("../../controllers/authController");
const productController = require("../../controllers/productController");

router
  .route("/")
  .get(productController.getProducts)
  .post(apiCheckIfAuthenticated, productController.createProduct);

router
  .route("/:id")
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
