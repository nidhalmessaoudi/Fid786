const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A product must have a name"],
    },
    description: {
      type: String,
    },
    photos: {
      type: [String],
      required: [true, "A product must have one or more photos"],
    },
    price: {
      type: Number,
      required: [true, "A product must have a price"],
    },
    fidPoints: {
      type: Number,
    },
    deliveryTime: {
      type: Number,
      required: [true, "A product must have a delivery time"],
    },
    store: {
      type: mongoose.Schema.ObjectId,
      ref: "Store",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.pre("findOne", function (next) {
  this.populate("store");
  next();
});

productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Product", productSchema);
