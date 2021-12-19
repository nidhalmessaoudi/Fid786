const Fidelity = require("../models/Fidelity");
const formatDate = require("../helpers/formatDate");

exports.getUserFidelities = async function (req, res) {
  try {
    const fidelities = await Fidelity.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });

    fidelities.forEach((doc) => {
      doc.date = formatDate(doc.createdAt);
      doc.updateDate = formatDate(doc.updatedAt);
    });

    res.render("fidelity", {
      title: `Fid786 | My Fidelities`,
      styleFile: "fidelity.css",
      user: req.user || undefined,
      fidelities,
    });
  } catch (err) {
    res.render("fidelity", {
      title: `Fid786 | My Fidelities`,
      styleFile: "fidelity.css",
      user: req.user || undefined,
      error:
        "Something went wrong when retrieving your fidelities. Please try again later or contact us.",
    });
  }
};
