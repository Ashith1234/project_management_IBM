const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a project title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    key: {
        type: String,
        uppercase: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
        default: 'planning'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: Date,
    budget: Number,
    manager: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    organization: {
        type: mongoose.Schema.ObjectId,
        ref: 'Organization',
        required: true
    },
    category: String,
    tags: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Project', ProjectSchema);
