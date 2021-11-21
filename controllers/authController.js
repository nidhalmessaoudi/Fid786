const passport = require("passport");
const validator = require("validator");
const connectEnsureLogin = require("connect-ensure-login");

const User = require("../models/User");

exports.setupAuth = function (passport) {
  passport.use(User.createStrategy());

  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());
};

exports.checkIfAuthenticated = connectEnsureLogin.ensureLoggedIn("/login");

exports.apiCheckIfAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    req.body.owner = req.user._id;
    return next();
  }
  res.status(401).json({
    status: "fail",
    message: "Unauthorized action",
  });
};

exports.register = async function (credentials) {
  try {
    const { username, email, password } = credentials;
    if (!username || !email || !password) {
      throw new Error("Missing credentials");
    }

    if (!validator.isAlphanumeric(username)) {
      throw new Error("A username must only contains letters and numbers");
    }

    if (!validator.isEmail(email)) {
      throw new Error("The email is unvalid");
    }

    const user = await User.findOne({ email });
    if (user) {
      throw new Error("A user with the given email is already registered");
    }

    await User.register({ username, email }, password);
  } catch (err) {
    err.name = "AuthError";
    throw err;
  }
};

exports.postLogin = passport.authenticate("local", {
  failureRedirect: "/login",
  successRedirect: "/",
  failureFlash: true,
});
