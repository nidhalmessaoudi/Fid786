exports.getHome = function (req, res) {
  res.render("home", {
    title: "Fid786",
    styleFile: "home.css",
    user: req.user || undefined,
  });
};

exports.getTerms = function (req, res) {
  res.render("terms", {
    title: "Fid786 | Terms Of Services",
    styleFile: "terms.css",
    user: req.user || undefined,
  });
};
