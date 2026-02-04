const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
        required: true
    },
    dueDate: Date,
    status: {
        type: String,
        enum: ['upcoming', 'active', 'completed', 'overdue'],
        default: 'upcoming'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Milestone', MilestoneSchema);
