const express = require('express');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes protected

// Get tasks (filtered by user role)
router.get('/', getTasks);

// Create Task (Manager, Admin) - Employees usually just consume or update status
router.post('/', authorize('manager', 'admin'), createTask);

// Update Task (Manager, Admin, Employee can update status)
router.put('/:id', updateTask);

// Delete Task (Manager, Admin)
router.delete('/:id', authorize('manager', 'admin'), deleteTask);

module.exports = router;
