exports.getHome = function (req, res) {
  res.render("home", {
    title: "Fid786",
    styleFile: undefined,
    user: req.user || undefined,
  });
};
