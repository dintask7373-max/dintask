const express = require('express');
const {
    getFollowUps,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp
} = require('../controllers/followUpController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin', 'sales'));

router
    .route('/')
    .get(getFollowUps)
    .post(createFollowUp);

router
    .route('/:id')
    .put(updateFollowUp)
    .delete(deleteFollowUp);

module.exports = router;
