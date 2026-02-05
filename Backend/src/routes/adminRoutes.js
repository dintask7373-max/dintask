const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getAllUsers, deleteUser } = require('../controllers/adminController');

const router = express.Router();

// Only Admin and Super Admin can access these routes
router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);

module.exports = router;
