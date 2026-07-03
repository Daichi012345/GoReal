const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const { getMission } = require("../controllers/missionController");
const { createMissionSubmission, uploadSubmissionPhoto } = require("../controllers/missionSubmissionController");

router.get("/", getMission);
router.post("/submit", auth, uploadSubmissionPhoto.single("photo"), createMissionSubmission);

module.exports = router;
