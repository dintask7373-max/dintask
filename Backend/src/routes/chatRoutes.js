const express = require('express');
const {
    accessChat,
    fetchChats,
    sendMessage,
    allMessages,
    createGroupChat
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All chat routes are protected

router.route('/').post(accessChat).get(fetchChats);
router.route('/group').post(createGroupChat);
router.route('/message').post(sendMessage);
router.route('/messages/:conversationId').get(allMessages);

module.exports = router;
