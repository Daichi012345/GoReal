const express = require("express");
const router = express.Router();

const { getMission } = require("../controllers/missionController");

router.get("/", getMission);

module.exports = router;
