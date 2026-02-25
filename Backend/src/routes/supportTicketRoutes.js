const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
    createTicket,
    getTickets,
    getTicket,
    updateTicket,
<<<<<<< HEAD
=======
    deleteTicket,
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
    getTicketStats
} = require('../controllers/supportTicketController');

const router = express.Router();

router.use(protect);

router.route('/stats')
    .get(getTicketStats);

router.route('/')
    .post(createTicket)
    .get(getTickets);

router.route('/:id')
    .get(getTicket)
<<<<<<< HEAD
    .put(updateTicket);
=======
    .put(updateTicket)
    .delete(deleteTicket);
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94

module.exports = router;
