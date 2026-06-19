const express = require("express");
const router = express.Router();

const { getEventsByGroup } = require("../controllers/eventController");

router.get("/group/:groupId", getEventsByGroup);

module.exports = router;
