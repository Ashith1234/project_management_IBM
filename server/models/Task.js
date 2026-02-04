const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a task title'],
        trim: true
    },
    description: String,
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
        required: true
    },
    milestone: {
        type: mongoose.Schema.ObjectId,
        ref: 'Milestone'
    },
    status: {
        type: String,
        enum: ['todo', 'in_progress', 'review', 'done'],
        default: 'todo'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    type: {
        type: String,
        enum: ['task', 'bug', 'feature'],
        default: 'task'
    },
    assignees: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    reporter: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    dueDate: Date,
    estimatedHours: Number,
    actualHours: {
        type: Number,
        default: 0
    },
    parentTask: {
        type: mongoose.Schema.ObjectId,
        ref: 'Task'
    },
    dependencies: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Task'
    }],
    attachments: [{
        name: String,
        url: String,
        fileType: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    comments: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        text: String,
        parentComment: {
            type: mongoose.Schema.ObjectId,
            default: null
        },
        mentions: [{
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    history: [{
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        action: String, // 'updated', 'status_change', 'commented', etc.
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    tags: [String],
    order: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Task', TaskSchema);
