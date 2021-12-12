const ApiFactoryController = require("./ApiFactoryController");
const Store = require("../models/Store");

// API
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
  return ApiFactoryController.deleteOne(req, res, Store);
};

// SERVER
exports.getOne = async function (req, res) {
  try {
    const store = await Store.findOne({ subUrl: req.params.store });

    res.render("store", {
      title: `Fid786 | ${store.name}`,
      styleFile: undefined,
      products: store.products,
    });
  } catch (err) {}
};
