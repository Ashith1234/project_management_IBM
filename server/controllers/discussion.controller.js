const asyncHandler = require('express-async-handler');
const Discussion = require('../models/Discussion');
const Project = require('../models/Project');

// @desc    Get all discussions for a project
// @route   GET /api/discussions?projectId=...
// @access  Private
exports.getDiscussions = asyncHandler(async (req, res) => {
    if (!req.query.projectId) {
        res.status(400);
        throw new Error('Please provide a projectId');
    }

    const discussions = await Discussion.find({ project: req.query.projectId })
        .populate('sender', 'name email avatar')
        .sort({ createdAt: 1 });

    res.status(200).json({
        success: true,
        count: discussions.length,
        data: discussions
    });
});

// @desc    Send a message in project discussion
// @route   POST /api/discussions
// @access  Private
exports.sendMessage = asyncHandler(async (req, res) => {
    req.body.sender = req.user.id;

    const project = await Project.findById(req.body.project);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    const discussion = await Discussion.create(req.body);

    // Populate sender info for the response
    const populatedDiscussion = await Discussion.findById(discussion._id).populate('sender', 'name email avatar');

    res.status(201).json({
        success: true,
        data: populatedDiscussion
    });
});
