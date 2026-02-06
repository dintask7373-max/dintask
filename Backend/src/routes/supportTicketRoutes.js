const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
    createTicket,
    getTickets,
    getTicket,
    updateTicket
} = require('../controllers/supportTicketController');

const router = express.Router();

router.use(protect);

router.route('/')
    .post(createTicket)
    .get(getTickets);

router.route('/:id')
    .get(getTicket)
    .put(updateTicket);

module.exports = router;
