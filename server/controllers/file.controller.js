const asyncHandler = require('express-async-handler');
const File = require('../models/File');
const Project = require('../models/Project');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
}).single('file');

exports.uploadMiddleware = upload;

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
    if (!req.file) {
        res.status(400);
        throw new Error('Please upload a file');
    }

    const { project: projectId } = req.body;

    if (!projectId) {
        res.status(400);
        throw new Error('Please provide a projectId');
    }

    const project = await Project.findById(projectId);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    const file = await File.create({
        name: req.file.originalname,
        url: `/uploads/${req.file.filename}`,
        project: projectId,
        uploadedBy: req.user.id,
        size: req.file.size,
        type: req.file.mimetype
    });

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

    // Delete physical file
    const filePath = path.join(__dirname, '..', file.url);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }

    await file.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});
