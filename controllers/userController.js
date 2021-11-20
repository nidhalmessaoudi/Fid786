const authController = require("./authController");

exports.getSignup = function (req, res) {
  if (req.isAuthenticated()) {
    res.redirect("/");
    return;
  }

  const errorFlash = req.flash("error");

  res.render("signup", {
    title: "Fid786 | Sign Up",
    styleFile: undefined,
    error: errorFlash.length > 0 ? errorFlash[0] : undefined,
  });
};

exports.postSignup = async function (req, res, next) {
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
    styleFile: undefined,
    error: errorFlash.length > 0 ? errorFlash[0] : undefined,
  });
};

exports.postLogin = authController.postLogin;
