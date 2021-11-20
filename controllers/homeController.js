exports.getHome = function (req, res) {
  console.log(req.user);
  res.render("home", {
    title: "Fid786",
    styleFile: undefined,
    user: req.user || undefined,
  });
};
