const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add an organization name'],
        unique: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    domain: String,
    address: String,
    website: String,
    subscription: {
        plan: {
            type: String,
            enum: ['free', 'pro', 'enterprise'],
            default: 'free'
        },
        startDate: Date,
        endDate: Date,
        status: {
            type: String,
            enum: ['active', 'inactive', 'cancelled'],
            default: 'active'
        }
    },
    settings: {
        allowTimeTracking: {
            type: Boolean,
            default: true
        },
        defaultCurrency: {
            type: String,
            default: 'USD'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Organization', OrganizationSchema);
