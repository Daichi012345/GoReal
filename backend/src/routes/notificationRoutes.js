const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { getNotifications, markAsRead } = require('../controllers/notificationsController');

router.get('/', auth, getNotifications);
router.post('/:id/read', auth, markAsRead);

module.exports = router;
