const ApiFactoryController = require("./ApiFactoryController");
const Product = require("../models/Product");

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
