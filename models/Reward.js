const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const rewardSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "A reward must belong to a store"],
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "A reward must have a product"],
    },
    requiredPoints: {
      type: Number,
      require: [true, "A reward must have the required points"],
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

rewardSchema.pre(/^find/, function (next) {
  this.populate({
    path: "owner",
    select: "username",
  }).populate("product");
  next();
});

rewardSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Reward", rewardSchema);
