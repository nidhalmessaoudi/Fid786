const ApiFactoryController = require("./ApiFactoryController");
const Store = require("../models/Store");

exports.getStores = function (req, res) {
  return ApiFactoryController.getAll(req, res, Store);
};

exports.getStore = function (req, res) {
  return ApiFactoryController.getOne(req, res, Store);
};

exports.createStore = function (req, res) {
  return ApiFactoryController.createOne(req, res, Store);
};

exports.updateStore = function (req, res) {
  return ApiFactoryController.updateOne(req, res, Store);
};

exports.deleteStore = function (req, res) {
  req.type = "STORE";
  return ApiFactoryController.deleteOne(req, res, Store);
};
