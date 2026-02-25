const express = require('express');
const {
  getTasks,
<<<<<<< HEAD
=======
  getTask,
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
  createTask,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes protected

<<<<<<< HEAD
// Get tasks (filtered by user role)
router.get('/', getTasks);

// Create Task (Manager, Admin) - Employees usually just consume or update status
router.post('/', authorize('manager', 'admin'), createTask);
=======
// Get tasks
router.get('/', getTasks);

// Get single task
router.get('/:id', getTask);

// Create Task (Manager, Admin, Employee)
router.post('/', authorize('manager', 'admin', 'employee', 'sales_executive'), createTask);
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94

// Update Task (Manager, Admin, Employee can update status)
router.put('/:id', updateTask);

<<<<<<< HEAD
// Delete Task (Manager, Admin)
router.delete('/:id', authorize('manager', 'admin'), deleteTask);
=======
// Delete Task (Manager, Admin, Employee - owner only)
router.delete('/:id', authorize('manager', 'admin', 'employee', 'sales_executive'), deleteTask);
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94

module.exports = router;
