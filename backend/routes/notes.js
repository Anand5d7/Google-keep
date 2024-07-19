const express = require('express');
const jwt = require('jsonwebtoken');
const Note = require('../models/note');

const router = express.Router();

const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).send('Access denied');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).send('Invalid token');
  }
};

// Create a new note
router.post('/', authenticate, async (req, res) => {
  try {
    const note = new Note({
      ...req.body,
      userId: req.user.userId,
    });
    await note.save();
    res.status(201).send(note);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Get all notes
router.get('/', authenticate, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.userId, isTrashed: false });
    res.json(notes);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Search notes
router.get('/search', authenticate, async (req, res) => {
  const query = req.query.q || '';
  try {
    const notes = await Note.find({
      userId: req.user.userId,
      isTrashed: false,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
      ],
    });
    res.json(notes);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Get notes by tag
router.get('/tags/:tag', authenticate, async (req, res) => {
  const tag = req.params.tag;
  try {
    const notes = await Note.find({
      userId: req.user.userId,
      isTrashed: false,
      tags: tag,
    });
    res.json(notes);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Get archived notes
router.get('/archived', authenticate, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.userId, isArchived: true });
    res.json(notes);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Get trashed notes
router.get('/trashed', authenticate, async (req, res) => {
  try {
    const notes = await Note.find({
      userId: req.user.userId,
      isTrashed: true,
      updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });
    res.json(notes);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// Update note
router.put('/:id', authenticate, async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    res.json(note);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
