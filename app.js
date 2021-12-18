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

// DYNAMIC PAGES ROUTES
const homeRoutes = require("./routes/server/homeRoutes");
const userRoutes = require("./routes/server/userRoutes");
const dashboardRoutes = require("./routes/server/dashboardRoutes");
const serverStoreRoutes = require("./routes/server/storeRoutes");
const serverProductRoutes = require("./routes/server/productRoutes");
const serverOrderRoutes = require("./routes/server/orderRoutes");
const fidelityRoutes = require("./routes/server/fidelityRoutes");

// API ROUTES
const overviewRoutes = require("./routes/api/overviewRoutes");
const storeRoutes = require("./routes/api/storeRoutes");
const productRoutes = require("./routes/api/productRoutes");
const orderRoutes = require("./routes/api/orderRoutes");
const rewardRoutes = require("./routes/api/rewardRoutes");

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

app.use(cors());

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

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

// DYNAMIC PAGES
app.use(homeRoutes);
app.use(userRoutes);
app.use(dashboardRoutes);
app.use("/stores", serverStoreRoutes);
app.use("/stores", serverProductRoutes);
app.use("/orders", serverOrderRoutes);
app.use("/fidelity", fidelityRoutes);

// API
app.use("/api/v1/overview", overviewRoutes);
app.use("/api/v1/stores", storeRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/rewards", rewardRoutes);

app.use(function (req, res) {
  res.status(404).send("Not Found");
});

module.exports = app;
