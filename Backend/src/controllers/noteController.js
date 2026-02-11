const Note = require('../models/Note');

// @desc    Get all notes for current user
// @route   GET /api/v1/notes
// @access  Private
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.id }).sort({ isPinned: -1, createdAt: -1 });
    res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Get single note
// @route   GET /api/v1/notes/:id
// @access  Private
exports.getNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });

    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }

    res.status(200).json({ success: true, data: note });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc    Create new note
// @route   POST /api/v1/notes
// @access  Private
exports.createNote = async (req, res) => {
  try {
    req.body.userId = req.user.id;
    req.body.userRole = req.user.role;

    const note = await Note.create(req.body);
    res.status(201).json({ success: true, data: note });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update note
// @route   PUT /api/v1/notes/:id
// @access  Private
exports.updateNote = async (req, res) => {
  try {
    let note = await Note.findOne({ _id: req.params.id, userId: req.user.id });

    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found or not authorized' });
    }

    note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: note });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete note
// @route   DELETE /api/v1/notes/:id
// @access  Private
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user.id });

    if (!note) {
      return res.status(404).json({ success: false, error: 'Note not found or not authorized' });
    }

    await note.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
