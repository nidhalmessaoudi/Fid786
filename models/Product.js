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
    availability: {
      type: String,
      enum: ["In Stock", "Out Of Stock"],
      default: "In Stock",
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

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: "owner",
    select: "username",
  }).populate("store");

  next();
});

productSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Product", productSchema);
