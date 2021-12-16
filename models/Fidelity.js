const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const fidelitySchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.ObjectId,
      ref: "Store",
      required: [true, "A fidelity must belong to a store"],
    },
    points: {
      type: Number,
      required: [true, "A fidelity must have a fid points"],
    },
    owner: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A fidelity must have an owner"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

fidelitySchema.pre(/^find/, function (next) {
  this.populate("store owner");
  next();
});

fidelitySchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Fidelity", fidelitySchema);
