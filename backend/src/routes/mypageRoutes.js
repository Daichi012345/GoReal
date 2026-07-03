const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProfile, updateProfile, updateAvatar, uploadAvatar, getHistory, getHistoryById } = require('../controllers/mypageController');

router.get('/', auth, getProfile);
router.get('/history', auth, getHistory);
router.get('/history/:submissionId', auth, getHistoryById);
router.put('/', auth, updateProfile);
router.put('/avatar', auth, uploadAvatar.single('avatar'), updateAvatar);

module.exports = router;
