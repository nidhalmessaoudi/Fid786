const ApiFactoryController = require("./ApiFactoryController");
const Reward = require("../models/Reward");

exports.getRewards = function (req, res) {
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
