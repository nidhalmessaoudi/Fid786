const ApiFactoryController = require("./ApiFactoryController");
const Order = require("../models/Order");
const Product = require("../models/Product");

exports.attachSellerAndBuyer = async function (req, res, next) {
  try {
    const productId = req.body.product;
    if (!productId) {
      throw new Error("Missing the product id");
    }
    const product = await Product.findById(productId);
    req.body.seller = product.owner._id;
    req.body.buyer = req.user._id;
    next();
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.getOrders = function (req, res) {
  return ApiFactoryController.getAll(req, res, Order);
};

exports.getOrder = function (req, res) {
  return ApiFactoryController.getOne(req, res, Order);
};

exports.createOrder = function (req, res) {
  return ApiFactoryController.createOne(req, res, Order);
};

exports.updateOrder = function (req, res) {
  return ApiFactoryController.updateOne(req, res, Order);
};

exports.deleteOrder = function (req, res) {
  return ApiFactoryController.deleteOne(req, res, Order);
};
