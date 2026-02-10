const express = require('express');
const {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getAllParticipants
} = require('../controllers/scheduleController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getSchedules)
  .post(authorize('admin', 'manager', 'sales', 'employee'), createSchedule);

router.get('/participants', authorize('admin', 'manager', 'sales', 'employee'), getAllParticipants);

router
  .route('/:id')
  .put(updateSchedule)
  .delete(deleteSchedule);

module.exports = router;
