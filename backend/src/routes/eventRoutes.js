const express = require("express");
const router = express.Router();

const {
  createEvent,
  getEventsByGroup,
} = require("../controllers/eventController");

router.post("/", createEvent);

router.get("/group/:groupId", getEventsByGroup);

module.exports = router;
