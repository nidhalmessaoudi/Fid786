const ApiFactoryController = require("./ApiFactoryController");
const Reward = require("../models/Reward");
const Product = require("../models/Product");

exports.getRewards = function (req, res) {
  req.query.owner = req.user._id;
  return ApiFactoryController.getAll(req, res, Reward);
};

exports.getReward = function (req, res) {
  return ApiFactoryController.getOne(req, res, Reward);
};

exports.createReward = function (req, res) {
  return ApiFactoryController.createOne(req, res, Reward);
};

exports.updateReward = function (req, res) {
  return ApiFactoryController.updateOne(req, res, Reward);
};

exports.deleteReward = function (req, res) {
  return ApiFactoryController.deleteOne(req, res, Reward);
};

exports.attachStoreToReward = async function (req, res, next) {
  const product = await Product.findOne({ _id: req.body.product });
  req.body.store = product.store._id;
  next();
};

exports.checkProductOwnership = async function (req, res, next) {
  try {
    const product = await Product.findById(req.body.product);
    if (!product.owner._id.equals(req.body.owner)) {
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
  ApiFactoryController.checkOwnership(req, res, next, Reward);
};
