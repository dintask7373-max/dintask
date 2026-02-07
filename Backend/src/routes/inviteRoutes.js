const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { sendInvite } = require('../controllers/inviteController');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.post('/', sendInvite);

module.exports = router;
