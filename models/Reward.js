const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const rewardSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "A reward must have a product"],
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
  this.populate("product");
  next();
});

rewardSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Reward", rewardSchema);
