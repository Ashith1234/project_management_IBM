const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a file name'],
        trim: true
    },
    url: {
        type: String,
        required: [true, 'Please add a file URL']
    },
    project: {
        type: mongoose.Schema.ObjectId,
        ref: 'Project',
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    size: Number,
    type: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('File', FileSchema);
