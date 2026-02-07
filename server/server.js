const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/database');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// Middleware
app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));
app.use(helmet({
    crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));

// Static folder for file uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected', socket.id);

    socket.on('join_project', (projectId) => {
        socket.join(projectId);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
    });
});

// Make io available in routes
app.set('io', io);

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/projects', require('./routes/project.routes'));
app.use('/api/tasks', require('./routes/task.routes'));
app.use('/api/timesheets', require('./routes/timesheet.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/milestones', require('./routes/milestone.routes'));
app.use('/api/files', require('./routes/file.routes'));
app.use('/api/discussions', require('./routes/discussion.routes'));
app.use('/api/analytics', require('./routes/analytics.routes'));
// app.use('/api/reports', require('./routes/report.routes'));

// Error Handling Middleware
app.use(require('./middleware/error.middleware'));

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
