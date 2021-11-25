exports.getDashboard = function (req, res) {
  res.render("dashboard", {
    title: "Fid786 | Dashboard",
    styleFile: "dashboard.css",
  });
};
