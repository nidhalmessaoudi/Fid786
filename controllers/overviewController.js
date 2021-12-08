const User = require("../models/User");

exports.getOverview = async function (req, res) {
  try {
    console.log(req.user);
    const user = await User.findById(req.user._id);
    console.log(user);

    res.status(200).json({
      status: "success",
      data: {
        numberOfStores: user.stores.length,
        numberOfProducts: user.products.length,
        numberOfOrders: user.orders.length,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Something went wrong when retreiving data",
    });
  }
};
