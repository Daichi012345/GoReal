const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const {
  addFriend,
  getFriends,
  getRecommendations,
  searchUsers,
} = require('../controllers/friendsController');

router.get('/', auth, getFriends);
router.get('/recommendations', auth, getRecommendations);
router.get('/search', auth, searchUsers);
router.post('/', auth, addFriend);

module.exports = router;