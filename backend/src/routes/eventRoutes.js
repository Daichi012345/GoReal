const express = require("express");
const router = express.Router();

const {
  createEvent,
  getEventsByGroup,
  getEventById,
  joinEventByCode,
} = require("../controllers/eventController");

router.get("/:eventId", getEventById);
router.post("/", createEvent);
router.post("/join", joinEventByCode);
router.get("/group/:groupId", getEventsByGroup);

module.exports = router;
