const ApiFactoryController = require("./ApiFactoryController");
const Order = require("../models/Order");

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
