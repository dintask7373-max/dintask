const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Helper to get correct model name from role
const getModelNameFromRole = (role) => {
    const maps = {
        'admin': 'Admin',
        'manager': 'Manager',
        'employee': 'Employee',
        'sales': 'SalesExecutive',
        'sales_executive': 'SalesExecutive',
        'superadmin': 'SuperAdmin'
    };
    return maps[role] || 'Employee';
};

// @desc    Access or Create 1-to-1 Chat
// @route   POST /api/v1/chat
exports.accessChat = async (req, res) => {
    const { userId, userModel, workspaceId } = req.body;

    if (!userId || !userModel || !workspaceId) {
        return res.status(400).json({ success: false, error: "Parameters incomplete" });
    }

    // Check if a chat exists between these two users
    let isChat = await Conversation.find({
        isGroup: false,
        workspaceId,
        $and: [
            { participants: { $elemMatch: { user: req.user.id } } },
            { participants: { $elemMatch: { user: userId } } }
        ]
    }).populate("participants.user", "-password").populate("lastMessage");

    if (isChat.length > 0) {
        res.status(200).json({ success: true, data: isChat[0] });
    } else {
        const chatData = {
            workspaceId,
            isGroup: false,
            participants: [
                { user: req.user.id, onModel: getModelNameFromRole(req.user.role) },
                { user: userId, onModel: userModel }
            ]
        };

        try {
            const createdChat = await Conversation.create(chatData);
            const fullChat = await Conversation.findOne({ _id: createdChat._id }).populate("participants.user", "-password");
            res.status(200).json({ success: true, data: fullChat });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
};

// @desc    Fetch chats for current user
// @route   GET /api/v1/chat
exports.fetchChats = async (req, res) => {
    try {
        const chats = await Conversation.find({
            participants: { $elemMatch: { user: req.user.id } }
        })
            .populate("participants.user", "-password")
            .populate("lastMessage")
            .sort({ updatedAt: -1 });

        res.status(200).json({ success: true, data: chats });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Send Message
// @route   POST /api/v1/chat/message
exports.sendMessage = async (req, res) => {
    const { content, conversationId, senderModel } = req.body;

    if (!content || !conversationId) {
        return res.status(400).json({ success: false, error: "Invalid data" });
    }

    const newMessage = {
        senderId: req.user.id,
        senderModel,
        text: content,
        conversationId
    };

    try {
        let message = await Message.create(newMessage);

        message = await Message.findById(message._id)
            .populate("senderId")
            .populate("conversationId");

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: message
        });

        res.status(200).json({ success: true, data: message });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Get all messages for a conversation
// @route   GET /api/v1/chat/messages/:conversationId
exports.allMessages = async (req, res) => {
    try {
        const messages = await Message.find({ conversationId: req.params.conversationId })
            .populate("senderId", "-password")
            .sort({ createdAt: 1 });

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

// @desc    Create Group Chat
// @route   POST /api/v1/chat/group
exports.createGroupChat = async (req, res) => {
    const { name, participants, workspaceId } = req.body;

    if (!participants || !name || !workspaceId) {
        return res.status(400).json({ success: false, error: "Please fill all fields" });
    }

    if (participants.length < 2) {
        return res.status(400).json({ success: false, error: "Minimum 3 users required for group (including you)" });
    }

    participants.push({ user: req.user.id, onModel: getModelNameFromRole(req.user.role) });

    try {
        const groupChat = await Conversation.create({
            groupName: name,
            participants,
            isGroup: true,
            workspaceId
        });

        const fullGroupChat = await Conversation.findOne({ _id: groupChat._id })
            .populate("participants.user", "-password");

        res.status(200).json({ success: true, data: fullGroupChat });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};
