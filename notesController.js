const Note = require('../models/Note');
const { validationResult } = require('express-validator');

// @desc  Get all notes for logged-in user
// @route GET /api/notes
exports.getNotes = async (req, res) => {
  try {
    const { search, tag } = req.query;
    let query = { user: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    const notes = await Note.find(query).sort({ updatedAt: -1 });
    res.json({ success: true, count: notes.length, notes });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc  Get single note
// @route GET /api/notes/:id
exports.getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this note' });
    }

    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc  Create note
// @route POST /api/notes
exports.createNote = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, content, tags } = req.body;
    const note = await Note.create({ user: req.user._id, title, content, tags: tags || [] });
    res.status(201).json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc  Update note
// @route PUT /api/notes/:id
exports.updateNote = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    let note = await Note.findById(req.params.id);

    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this note' });
    }

    const { title, content, tags } = req.body;
    note.title = title || note.title;
    note.content = content || note.content;
    note.tags = tags !== undefined ? tags : note.tags;
    await note.save();

    res.json({ success: true, note });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// @desc  Delete note
// @route DELETE /api/notes/:id
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) return res.status(404).json({ success: false, message: 'Note not found' });
    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this note' });
    }

    await note.deleteOne();
    res.json({ success: true, message: 'Note deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};