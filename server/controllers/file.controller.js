const asyncHandler = require('express-async-handler');
const File = require('../models/File');
const Project = require('../models/Project');

// @desc    Get all files for a project
// @route   GET /api/files?projectId=...
// @access  Private
exports.getFiles = asyncHandler(async (req, res) => {
    let query;

    if (req.query.projectId) {
        query = File.find({ project: req.query.projectId });
    } else {
        // Return nothing or all files based on auth (for now, enforce projectId)
        return res.status(400).json({ success: false, message: 'Please provide a projectId' });
    }

    query = query.populate('uploadedBy', 'name email avatar');

    const files = await query;

    res.status(200).json({
        success: true,
        count: files.length,
        data: files
    });
});

// @desc    Upload a file
// @route   POST /api/files
// @access  Private
exports.uploadFile = asyncHandler(async (req, res) => {
    req.body.uploadedBy = req.user.id;

    // In a real app, you'd handle the file upload buffer here.
    // For this implementation, we expect name, url, project, size, type in body.

    const project = await Project.findById(req.body.project);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    const file = await File.create(req.body);

    res.status(201).json({
        success: true,
        data: file
    });
});

// @desc    Delete a file
// @route   DELETE /api/files/:id
// @access  Private
exports.deleteFile = asyncHandler(async (req, res) => {
    const file = await File.findById(req.params.id);

    if (!file) {
        res.status(404);
        throw new Error('File not found');
    }

    // Check ownership or manager role
    if (file.uploadedBy.toString() !== req.user.id && !['admin', 'project_manager'].includes(req.user.role)) {
        res.status(403);
        throw new Error('Not authorized to delete this file');
    }

    await file.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});
