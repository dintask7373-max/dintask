const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  addComment
} = require('../controllers/taskController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes protected

// Get tasks
router.get('/', getTasks);

// Get single task
router.get('/:id', getTask);

// Create Task (Manager, Admin, Employee)
router.post('/', authorize('manager', 'admin', 'employee'), createTask);

// Update Task (Manager, Admin, Employee can update status)
router.put('/:id', updateTask);

// Delete Task (Manager, Admin, Employee - owner only)
router.delete('/:id', authorize('manager', 'admin', 'employee'), deleteTask);

// Add Comment
router.post('/:id/comments', protect, addComment);

module.exports = router;
