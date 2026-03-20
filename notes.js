const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getNotes, getNote, createNote, updateNote, deleteNote } = require('../controllers/notesController');
const { protect } = require('../middleware/auth');

// protectection middleware to ensure only authenticated users can access these routes
router.use(protect);

router.get('/', getNotes);
router.get('/:id', getNote);

router.post('/', [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required')
], createNote);

router.put('/:id', [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().notEmpty().withMessage('Content cannot be empty')
], updateNote);

router.delete('/:id', deleteNote);

module.exports = router;