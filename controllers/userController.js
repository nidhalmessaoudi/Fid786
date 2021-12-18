const authController = require("./authController");

exports.getRegister = function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
    return;
  }

  const errorFlash = req.flash("error");

  res.render("register", {
    title: "Fid786 | Sign Up",
    styleFile: "sign.css",
    user: req.user || undefined,
    error: errorFlash.length > 0 ? errorFlash[0] : undefined,
  });
};

exports.postRegister = async function (req, res, next) {
  try {
    if (req.isAuthenticated()) {
      res.redirect("/");
      return;
    }

    const credentials = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    };

    await authController.register(credentials);
    authController.postLogin(req, res, next);
  } catch (err) {
    console.log(err);
    if (err.name === "AuthError") {
      req.flash("error", err.message);
    }
    res.redirect("/signup");
  }
};

exports.getLogin = function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
    return;
  }

  const errorFlash = req.flash("error");

  res.render("login", {
    title: "Fid786 | Log In",
    styleFile: "sign.css",
    user: req.user || undefined,
    error: errorFlash.length > 0 ? errorFlash[0] : undefined,
  });
};

exports.postLogin = authController.postLogin;

exports.getLogout = function (req, res) {
  req.logout();
  res.redirect("/");
};
