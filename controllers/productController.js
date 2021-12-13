const ApiFactoryController = require("./ApiFactoryController");
const Product = require("../models/Product");

// API
exports.getProducts = function (req, res) {
  return ApiFactoryController.getAll(req, res, Product);
};

exports.getProduct = function (req, res) {
  return ApiFactoryController.getOne(req, res, Product);
};

exports.createProduct = function (req, res) {
  return ApiFactoryController.createOne(req, res, Product);
};

exports.updateProduct = function (req, res) {
  return ApiFactoryController.updateOne(req, res, Product);
};

exports.deleteProduct = function (req, res) {
  return ApiFactoryController.deleteOne(req, res, Product);
};

// SERVER
exports.getOne = async function (req, res, next) {
  try {
    const product = await Product.findOne({ subUrl: req.params.productId });

    if (product.store.subUrl !== req.params.store) {
      return next();
    }

    const otherProducts = await Product.paginate(
      { _id: { $ne: product._id }, store: product.store },
      { page: 1, limit: 4, sort: { createdAt: -1 } }
    );

    res.render("product", {
      title: `Fid786 | ${product.name}`,
      styleFile: "product.css",
      product,
      otherProducts: otherProducts.docs,
    });
  } catch (err) {
    next();
  }
};
