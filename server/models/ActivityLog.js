const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    organization: {
        type: mongoose.Schema.ObjectId,
        ref: 'Organization',
        required: true
    },
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project'
    },
    action: {
        type: String,
        required: true,
        enum: ['created', 'updated', 'deleted', 'assigned', 'status_change', 'commented', 'login']
    },
    targetType: {
        type: String,
        required: true,
        enum: ['project', 'task', 'user', 'organization', 'timesheet']
    },
    targetId: {
        type: mongoose.Schema.ObjectId,
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
