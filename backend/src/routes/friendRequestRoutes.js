const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const {
  getIncomingRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
} = require('../controllers/friendRequestsController');

router.get('/incoming', auth, getIncomingRequests);
router.get('/sent', auth, getSentRequests);
router.post('/:id/accept', auth, acceptRequest);
router.post('/:id/reject', auth, rejectRequest);

module.exports = router;
