const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 5000;

// MongoDB setup
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// MongoDB models
const User = mongoose.model('User', new mongoose.Schema({
    username: String,
    password: String
}));

const Note = mongoose.model('Note', new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    title: String,
    content: String,
    tags: [String],
    backgroundColor: String,
    reminder: Date,
    isArchived: { type: Boolean, default: false },
    isTrashed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
}));

// Middleware to verify JWT token
const authMiddleware = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401);
    
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Routes
app.post('/auth/signup', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).send('User created');
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).send('Username already exists');
        } else {
            console.error('Signup error:', error);
            res.status(500).send('Signup failed');
        }
    }
});

app.post('/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
            res.json({ token });
        } else {
            res.sendStatus(401);
        }
    } catch (error) {
        console.error('Login Error:', error.message);
        res.status(500).json({ message: 'Login failed. Please try again.' });
    }
});

app.get('/notes', authMiddleware, async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user.userId, isArchived: false, isTrashed: false });
        res.json(notes);
    } catch (error) {
        console.error('Fetch Notes Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch notes. Please try again.' });
    }
});

app.get('/notes/search', authMiddleware, async (req, res) => {
    const query = req.query.query;
    if (!query) {
        return res.status(400).json({ message: 'Query parameter is required' });
    }
    try {
        const notes = await Note.find({
            userId: req.user.userId,
            title: { $regex: query, $options: 'i' }, // Case-insensitive search
            isArchived: false,
            isTrashed: false
        });
        res.json(notes);
    } catch (error) {
        console.error('Search Notes Error:', error.message);
        res.status(500).json({ message: 'Failed to search notes. Please try again.' });
    }
});



app.get('/notes/archived', authMiddleware, async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user.userId, isArchived: true });
        res.json(notes);
    } catch (error) {
        console.error('Fetch Archived Notes Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch archived notes. Please try again.' });
    }
});

app.get('/notes/trashed', authMiddleware, async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user.userId, isTrashed: true });
        res.json(notes);
    } catch (error) {
        console.error('Fetch Trashed Notes Error:', error.message);
        res.status(500).json({ message: 'Failed to fetch trashed notes. Please try again.' });
    }
});

app.post('/notes', authMiddleware, async (req, res) => {
    const note = new Note({ ...req.body, userId: req.user.userId });
    try {
        await note.save();
        res.sendStatus(201);
    } catch (error) {
        console.error('Create Note Error:', error.message);
        res.status(500).json({ message: 'Failed to create note. Please try again.' });
    }
});

app.put('/notes/:id', authMiddleware, async (req, res) => {
    try {
        await Note.findByIdAndUpdate(req.params.id, req.body);
        res.sendStatus(200);
    } catch (error) {
        console.error('Update Note Error:', error.message);
        res.status(500).json({ message: 'Failed to update note. Please try again.' });
    }
});

app.delete('/notes/:id', authMiddleware, async (req, res) => {
    try {
        await Note.findByIdAndDelete(req.params.id);
        res.sendStatus(200);
    } catch (error) {
        console.error('Delete Note Error:', error.message);
        res.status(500).json({ message: 'Failed to delete note. Please try again.' });
    }
});

app.put('/notes/archive/:id', authMiddleware, async (req, res) => {
    try {
        await Note.findByIdAndUpdate(req.params.id, { isArchived: true });
        res.sendStatus(200);
    } catch (error) {
        console.error('Archive Note Error:', error.message);
        res.status(500).json({ message: 'Failed to archive note. Please try again.' });
    }
});

app.put('/notes/trash/:id', authMiddleware, async (req, res) => {
    try {
        await Note.findByIdAndUpdate(req.params.id, { isTrashed: true });
        res.sendStatus(200);
    } catch (error) {
        console.error('Trash Note Error:', error.message);
        res.status(500).json({ message: 'Failed to trash note. Please try again.' });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
