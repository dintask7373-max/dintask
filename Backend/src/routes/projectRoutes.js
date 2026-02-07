const express = require('express');
const {
  getProjects,
  getProject,
  updateProject
} = require('../controllers/projectController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes protected

// Get all projects for current user role
router.get('/', getProjects);

// Get single project
router.get('/:id', getProject);

// Update project (Managers update their own)
router.put('/:id', authorize('admin', 'manager'), updateProject);

module.exports = router;
