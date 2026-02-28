const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Note schema
const noteSchema = new mongoose.Schema({
  title:   String,
  body:    String,
  tag:     { type: String, enum: ['work','idea','personal','design'], default: 'idea' },
  updated: { type: Date, default: Date.now }
});
const Note = mongoose.model('Note', noteSchema);

// ── Routes ──
app.get('/api/notes', async (req, res) => {
  const notes = await Note.find().sort({ updated: -1 });
  res.json(notes);
});

app.post('/api/notes', async (req, res) => {
  const note = await Note.create(req.body);
  res.json(note);
});

app.put('/api/notes/:id', async (req, res) => {
  const note = await Note.findByIdAndUpdate(req.id, req.body, { new: true });
  res.json(note);
});

app.delete('/api/notes/:id', async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
