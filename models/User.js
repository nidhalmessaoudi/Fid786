const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    type: {
      type: String,
      enum: ["client", "seller", "admin"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("stores", {
  ref: "Store",
  foreignField: "owner",
  localField: "_id",
});

userSchema.virtual("products", {
  ref: "Product",
  foreignField: "owner",
  localField: "_id",
});

userSchema.virtual("orders", {
  ref: "Order",
  foreignField: "seller",
  localField: "_id",
});

userSchema.pre("findOne", function (next) {
  this.populate("stores products orders");

  next();
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
