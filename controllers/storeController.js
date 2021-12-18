const ApiFactoryController = require("./ApiFactoryController");
const Store = require("../models/Store");
const Product = require("../models/Product");
const Reward = require("../models/Reward");
const formatDate = require("../helpers/formatDate");

// API
exports.getStores = function (req, res) {
  req.query.owner = req.user._id;
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

    let products;
    const productsOptions = {
      page: req.query.p || 1,
      limit: 8,
      sort: { createdAt: -1 },
    };

    if (req.query.filter === "rewards") {
      products = await Reward.paginate({ store: store._id }, productsOptions);
      products.type = "REWARD";
    } else {
      products = await Product.paginate({ store: store._id }, productsOptions);
      products.type = "PRODUCT";
    }

    if (!products.docs.length && products.totalDocs) {
      return res.redirect(`/stores/${store.subUrl}?p=${products.totalPages}`);
    }

    products.docs.forEach((doc) => {
      doc.date = formatDate(doc.createdAt);
    });

    res.render(products.type === "PRODUCT" ? "store" : "storeRewards", {
      title: `Fid786 | ${store.name}`,
      styleFile: "store.css",
      user: req.user || undefined,
      store,
      [products.type === "PRODUCT" ? "products" : "rewards"]: products,
    });
  } catch (err) {
    return next();
  }
};

exports.checkOwnership = async function (req, res, next) {
  ApiFactoryController.checkOwnership(req, res, next, Store);
};
