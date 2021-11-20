const mongoose = require("mongoose");
const dotenv = require("dotenv");

const rejectionHandler = require("./utils/rejectionHandler");
const uncaughtExcHandler = require("./utils/uncaughtExcHandler");

// HANDLE UNCAUGHT EXCEPTIONS
uncaughtExcHandler();

dotenv.config();
const app = require("./app");

mongoose
  .connect(process.env.DB_HOST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to database!");

    const port = process.env.PORT || 3000;

    const server = app.listen(port, () => {
      console.log(`Server has started on port ${port}...`);
    });

    // HANDLE UNHANDLED REJECTIONS
    rejectionHandler(server);
  })
  .catch((err) => {
    console.error(err);
  });
