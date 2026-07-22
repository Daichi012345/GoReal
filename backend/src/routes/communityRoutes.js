const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const { getCommunityFeed } = require("../controllers/communityController");

router.get("/feed", auth, getCommunityFeed);

module.exports = router;