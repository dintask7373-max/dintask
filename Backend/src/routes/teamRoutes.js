const express = require('express');
const {
    createTeam,
    getMyTeams,
    updateTeam,
    deleteTeam
} = require('../controllers/teamController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('manager', 'admin'));

router
    .route('/')
    .get(getMyTeams)
    .post(createTeam);

router
    .route('/:id')
    .put(updateTeam)
    .delete(deleteTeam);

module.exports = router;
