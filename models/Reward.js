const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const rewardSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "A reward must have a product"],
    },
    store: {
      type: mongoose.Schema.ObjectId,
      ref: "Store",
      required: [true, "A reward must belong to a store"],
    },
    requiredPoints: {
      type: Number,
      require: [true, "A reward must have the required points"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

rewardSchema.pre(/^find/, function (next) {
  this.populate("product store");
  next();
});

rewardSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Reward", rewardSchema);
