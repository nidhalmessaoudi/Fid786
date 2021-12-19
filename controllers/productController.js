const ApiFactoryController = require("./ApiFactoryController");
const Product = require("../models/Product");
const Store = require("../models/Store");
const Reward = require("../models/Reward");
const Fidelity = require("../models/Fidelity");
const formatDate = require("../helpers/formatDate");

// API
exports.checkStoreOwnership = async function (req, res, next) {
  try {
    const store = await Store.findById(req.body.store);
    if (!store.owner._id.equals(req.body.owner)) {
      return res.status(403).json({
        status: "fail",
        message: "Unauthorized action",
      });
    }
    return next();
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: "Something went wrong",
    });
  }
};

exports.checkOwnership = async function (req, res, next) {
  ApiFactoryController.checkOwnership(req, res, next, Product);
};

exports.getProducts = function (req, res) {
  req.query.owner = req.user._id;
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
    let product = undefined;
    let reward = undefined;
    let fidelity = undefined;
    if (req.query.type === "reward" && req.user) {
      reward = await Reward.findOne({ product: req.params.productId });
      if (reward) {
        product = reward.product;
        fidelity = await Fidelity.findOne({
          store: product.store._id,
          owner: req.user._id,
        });
      }
    }

    if (!product) {
      product = await Product.findOne({ _id: req.params.productId });
    }

    if (product.store.subUrl !== req.params.store) {
      return next();
    }

    const otherProducts = await Product.paginate(
      { _id: { $ne: product._id }, store: product.store },
      { page: 1, limit: 4, sort: { createdAt: -1 } }
    );

    otherProducts.docs.forEach((doc) => {
      doc.date = formatDate(doc.createdAt);
    });

    res.render("product", {
      title: `Fid786 | ${product.name}`,
      styleFile: "product.css",
      user: req.user || undefined,
      product,
      otherProducts: otherProducts.docs,
      reward,
      fidelity,
      type:
        fidelity && fidelity.points > reward.requiredPoints ? "FREE" : "PRICED",
    });
  } catch (err) {
    console.log(err);
    next();
  }
};
