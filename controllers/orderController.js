const ApiFactoryController = require("./ApiFactoryController");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Reward = require("../models/Reward");
const Fidelity = require("../models/Fidelity");
const formatDate = require("../helpers/formatDate");

// API
exports.attachSellerAndBuyer = async function (req, res, next) {
  try {
    const productId = req.body.product;
    if (!productId) {
      throw new Error("Missing the product id");
    }
    const product = await Product.findById(productId);
    req.body.seller = product.owner._id;
    req.body.buyer = req.user._id;
    return next();
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.checkForOrderType = async function (req, res, next) {
  try {
    if (req.query.type !== "free") {
      return next();
    }

    const reward = await Reward.findOne({ product: req.body.product });
    if (!reward) {
      return next();
    }

    const fidelity = await Fidelity.findOne({
      store: reward.store._id,
      owner: req.user._id,
    });
    fidelity.points = fidelity.points - reward.requiredPoints;

    await fidelity.save();
    return next();
  } catch (err) {
    return next();
  }
};

exports.getOrders = function (req, res) {
  req.query.seller = req.user._id;
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

// SERVER
exports.getUserOrders = async function (req, res) {
  try {
    const userOrders = await Order.find({ buyer: req.user._id }).sort({
      createdAt: -1,
    });

    userOrders.forEach((doc) => {
      doc.date = formatDate(doc.createdAt);
      doc.updateDate = formatDate(doc.updatedAt);
    });

    res.render("order", {
      title: `Fid786 | My Orders`,
      styleFile: "order.css",
      user: req.user || undefined,
      orders: userOrders,
    });
  } catch (err) {
    res.render("order", {
      title: `Fid786 | My Orders`,
      styleFile: "order.css",
      user: req.user || undefined,
      error:
        "Something went wrong when retrieving your orders. Please try again later or contact us.",
    });
  }
};

exports.checkOwnership = async function (req, res, next) {
  ApiFactoryController.checkOwnership(req, res, next, Order);
};
