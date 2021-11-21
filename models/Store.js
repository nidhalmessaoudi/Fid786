const mongoose = require("mongoose");
const validator = require("validator");
const mongoosePaginate = require("mongoose-paginate-v2");

const storeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A store must have a name"],
    },
    location: {
      type: String,
      required: [true, "A store must have a location"],
    },
    subUrl: {
      type: String,
      required: [true, "A store must have a url path"],
      unique: [true, "This url path is already used"],
      validate: [validator.isAlphanumeric, "A url path must be alphanumeric"],
    },
    logo: {
      type: String,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A store must have an owner"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

storeSchema.virtual("products", {
  ref: "Product",
  foreignField: "store",
  localField: "_id",
});

storeSchema.virtual("orders", {
  ref: "Order",
  foreignField: "store",
  localField: "_id",
});

storeSchema.virtual("rewards", {
  ref: "Reward",
  foreignField: "store",
  localField: "_id",
});

storeSchema.pre("findOne", function (next) {
  this.populate({
    path: "owner",
    select: "username",
  }).populate("products rewards");

  next();
});

storeSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Store", storeSchema);
