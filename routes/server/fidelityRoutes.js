const router = require("express").Router();

const fidelityController = require("../../controllers/fidelityController");
const { checkIfAuthenticated } = require("../../controllers/authController");

router.get("/", checkIfAuthenticated, fidelityController.getUserFidelities);

module.exports = router;
