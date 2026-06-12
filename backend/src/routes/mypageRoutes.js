const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProfile, updateProfile, updateAvatar, uploadAvatar } = require('../controllers/mypageController');

router.get('/', auth, getProfile);
router.put('/', auth, updateProfile);
router.put('/avatar', auth, uploadAvatar.single('avatar'), updateAvatar);

module.exports = router;
