const router = require("express").Router();

const productController = require("../../controllers/productController");
const { apiCheckIfAuthenticated } = require("../../controllers/authController");

router.use(apiCheckIfAuthenticated);

router
  .route("/")
  .get(productController.getProducts)
  .post(productController.checkStoreOwnership, productController.createProduct);

router
  .route("/:id")
  .get(productController.getProduct)
  .patch(
    productController.checkStoreOwnership,
    productController.checkOwnership,
    productController.updateProduct
  )
  .delete(productController.checkOwnership, productController.deleteProduct);

module.exports = router;
