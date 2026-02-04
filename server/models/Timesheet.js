const mongoose = require('mongoose');

const TimesheetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
        required: true
    },
    task: {
        type: mongoose.Schema.ObjectId,
        ref: 'Task'
    },
    date: {
        type: Date,
        required: true
    },
    hours: {
        type: Number,
        required: true,
        min: 0.25,
        max: 24
    },
    description: String,
    billable: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'approved', 'rejected'],
        default: 'draft'
    },
    approvedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Timesheet', TimesheetSchema);
