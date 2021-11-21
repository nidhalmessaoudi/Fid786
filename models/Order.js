const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const orderSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "An order must have a product"],
    },
    state: {
      type: String,
      enum: ["pending", "delivered"],
      default: "pending",
    },
    price: {
      type: Number,
      required: [true, "An order must have a price"],
    },
    amount: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderSchema.pre(/^find/, function (next) {
  this.populate("product");
  next();
});

orderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Order", orderSchema);
