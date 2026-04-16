console.log("Server file loaded");
require('dotenv').config();
const express = require('express');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// ✅ Health Check
app.get('/health', (req, res) => {
    res.send('OK');
});

// ✅ REGISTER
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        (err) => {
            if (err) return res.status(500).send(err);
            res.send('User registered');
        }
    );
});

// ✅ LOGIN
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query(
        'SELECT * FROM users WHERE username = ?',
        [username],
        async (err, results) => {
            if (err) return res.status(500).send(err);
            if (results.length === 0) return res.send('User not found');

            const user = results[0];

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.send('Invalid credentials');

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);

            res.json({ token });
        }
    );
});

// ✅ AUTH MIDDLEWARE
function auth(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) return res.send('No token');

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    } catch {
        res.send('Invalid token');
    }
}

// ✅ CREATE TASK
app.post('/tasks', auth, (req, res) => {
    const { title } = req.body;

    db.query(
        'INSERT INTO tasks (title, user_id) VALUES (?, ?)',
        [title, req.userId],
        (err) => {
            if (err) return res.status(500).send(err);
            res.send('Task created');
        }
    );
});

// ✅ GET TASKS
app.get('/tasks', auth, (req, res) => {
    db.query(
        'SELECT * FROM tasks WHERE user_id = ?',
        [req.userId],
        (err, results) => {
            if (err) return res.status(500).send(err);
            res.json(results);
        }
    );
});

// START SERVER
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// ✅ UPDATE TASK
app.put('/tasks/:id', auth, (req, res) => {
    const { title } = req.body;
    const taskId = req.params.id;

    db.query(
        'UPDATE tasks SET title = ? WHERE id = ? AND user_id = ?',
        [title, taskId, req.userId],
        (err, result) => {
            if (err) return res.status(500).send(err);

            if (result.affectedRows === 0) {
                return res.send('Task not found or unauthorized');
            }

            res.send('Task updated');
        }
    );
});
// ✅ DELETE TASK
app.delete('/tasks/:id', auth, (req, res) => {
    const taskId = req.params.id;

    db.query(
        'DELETE FROM tasks WHERE id = ? AND user_id = ?',
        [taskId, req.userId],
        (err, result) => {
            if (err) return res.status(500).send(err);

            if (result.affectedRows === 0) {
                return res.send('Task not found or unauthorized');
            }

            res.send('Task deleted');
        }
    );
});