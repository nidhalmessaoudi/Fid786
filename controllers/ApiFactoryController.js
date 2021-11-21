const mongoose = require("mongoose");

exports.getAll = async function (req, res, model) {
  try {
    const options = { page: req.query.p || 1, limit: 10 };

    const queries = req.query;
    delete queries.p;

    const results = await model.paginate(queries, options);

    res.status(200).json({
      status: "success",
      total: results.totalDocs,
      data: results.docs,
      hasPrevPage: results.hasPrevPage,
      hasNextPage: results.hasNextPage,
      page: results.page,
      totalPages: results.totalPages,
      prevPage: results.prevPage,
      nextPage: results.nextPage,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong when retrieving data.",
    });
  }
};

exports.getOne = async function (req, res, model) {
  try {
    const result = await model.findById(req.params.id);

    res.status(200).json({
      status: "success",
      doc: result,
    });
  } catch (err) {
    console.log(err);
    if (err instanceof mongoose.Error) {
      res.status(400).json({
        status: "fail",
        message: "Invalid document id",
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "Something went wrong when retreiving data",
      });
    }
  }
};

exports.createOne = async function (req, res, model) {
  try {
    const createdDoc = await model.create(req.body);
    res.status(201).json({
      status: "success",
      doc: createdDoc,
    });
  } catch (err) {
    console.log(err);
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((el) => el.message);
      const message = `Invalid input data: ${errors.join(". ")}`;
      res.status(400).json({
        status: "fail",
        message,
      });
    } else {
      res.status(500).json({
        status: "fail",
        message: "Something went wrong when creating and saving data",
      });
    }
  }
};

exports.updateOne = async function (req, res, model) {
  try {
    const result = await model.update(req.params.id, req.body);

    res.status(200).json({
      status: "success",
      doc: result,
    });
  } catch (err) {
    console.log(err);
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map((el) => el.message);
      const message = `Invalid input data: ${errors.join(". ")}`;
      res.status(400).json({
        status: "fail",
        message,
      });
    } else {
      res.status(500).json({
        status: "fail",
        message: "Something went wrong when updating and saving data",
      });
    }
  }
};

exports.deleteOne = async function (req, res, model) {
  try {
    await model.delete(req.params.id);
    res.status(204).json({
      status: "success",
      message: null,
    });
  } catch (err) {
    console.log(err);
    if (err instanceof mongoose.Error) {
      res.status(400).json({
        status: "fail",
        message: "Invalid document id",
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "Something went wrong when retreiving data",
      });
    }
  }
};
