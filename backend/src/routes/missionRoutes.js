const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {
  getMission,
  createMission,
} = require("../controllers/missionController");
const {
  createMissionSubmission,
  uploadSubmissionPhoto,
} = require("../controllers/missionSubmissionController");

router.get("/", getMission);
router.post(
  "/submit",
  auth,
  uploadSubmissionPhoto.single("photo"),
  createMissionSubmission,
);
router.post("/", createMission);

module.exports = router;
