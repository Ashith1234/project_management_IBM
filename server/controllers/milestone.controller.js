const asyncHandler = require('express-async-handler');
const Milestone = require('../models/Milestone');
const Project = require('../models/Project');

// @desc    Get milestones for a project
// @route   GET /api/projects/:projectId/milestones
// @access  Private
exports.getMilestones = asyncHandler(async (req, res) => {
    const milestones = await Milestone.find({ project: req.params.projectId })
        .sort('dueDate');

    res.status(200).json({
        success: true,
        count: milestones.length,
        data: milestones
    });
});

// @desc    Get single milestone
// @route   GET /api/milestones/:id
// @access  Private
exports.getMilestone = asyncHandler(async (req, res) => {
    const milestone = await Milestone.findById(req.params.id)
        .populate('project', 'title');

    if (!milestone) {
        res.status(404);
        throw new Error('Milestone not found');
    }

    res.status(200).json({
        success: true,
        data: milestone
    });
});

// @desc    Create milestone
// @route   POST /api/projects/:projectId/milestones
// @access  Private (PM, Team Lead, Admin)
exports.createMilestone = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    req.body.project = req.params.projectId;

    const milestone = await Milestone.create(req.body);

    res.status(201).json({
        success: true,
        data: milestone
    });
});

// @desc    Update milestone
// @route   PUT /api/milestones/:id
// @access  Private (PM, Team Lead, Admin)
exports.updateMilestone = asyncHandler(async (req, res) => {
    let milestone = await Milestone.findById(req.params.id);

    if (!milestone) {
        res.status(404);
        throw new Error('Milestone not found');
    }

    milestone = await Milestone.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: milestone
    });
});

// @desc    Delete milestone
// @route   DELETE /api/milestones/:id
// @access  Private (PM, Admin)
exports.deleteMilestone = asyncHandler(async (req, res) => {
    const milestone = await Milestone.findById(req.params.id).populate('project');

    if (!milestone) {
        res.status(404);
        throw new Error('Milestone not found');
    }

    // Check permissions
    // Admin can delete any milestone
    // Project Manager can delete milestones in their own project
    const isProjectManager = milestone.project && milestone.project.manager.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAdmin && !isProjectManager) {
        res.status(403);
        throw new Error('Not authorized to delete this milestone');
    }

    await milestone.deleteOne();

    res.status(200).json({
        success: true,
        data: {}
    });
});
