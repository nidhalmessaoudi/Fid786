const ApiFactoryController = require("./ApiFactoryController");
const Store = require("../models/Store");
const Product = require("../models/Product");
const formatDate = require("../helpers/formatDate");

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
exports.getOne = async function (req, res, next) {
  try {
    const store = await Store.findOne({ subUrl: req.params.store });

    const productsOptions = {
      page: req.query.p || 1,
      limit: 8,
      sort: { createdAt: -1 },
    };

    const products = await Product.paginate(
      { store: store._id },
      productsOptions
    );

    if (!products.docs.length && products.totalDocs) {
      return res.redirect(`/stores/${store.subUrl}?p=${products.totalPages}`);
    }

    products.docs.forEach((doc) => {
      doc.date = formatDate(doc.createdAt);
    });

    res.render("store", {
      title: `Fid786 | ${store.name}`,
      styleFile: "store.css",
      user: req.user || undefined,
      store,
      products,
    });
  } catch (err) {
    return next();
  }
};
