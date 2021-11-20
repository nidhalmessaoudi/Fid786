const path = require("path");

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const flash = require("connect-flash");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const { setupAuth } = require("./controllers/authController");

// ROUTES
const homeRoutes = require("./routes/server/homeRoutes");
const userRoutes = require("./routes/server/userRoutes");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

app.use(cors());

app.use(helmet());

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: process.env.SESSION_DAYS * 24 * 60 * 60 * 1000,
      secure: process.env.MODE === "production" ? true : false,
    },
  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

setupAuth(passport);

app.use(mongoSanitize());

app.use(xss());

app.use(hpp());

// Routes Usage
app.use(homeRoutes);
app.use(userRoutes);

app.get("*", function (req, res) {
  res.send("Hello World");
});

module.exports = app;
