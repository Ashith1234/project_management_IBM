const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = asyncHandler(async (req, res) => {
    let query;

    // If admin/admin-like, return all projects for the organization (or all if superadmin)
    // For now assuming filtering by Organization
    if (req.user.organization) {
        query = Project.find({ organization: req.user.organization });
    } else {
        // Fallback or Superadmin view
        query = Project.find();
    }

    // Populate manager details
    query = query.populate('manager', 'name email avatar');

    const projects = await query;

    res.status(200).json({
        success: true,
        count: projects.length,
        data: projects
    });
});

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id)
        .populate('manager', 'name email avatar')
        .populate('members', 'name email avatar')
        .populate('organization');

    if (!project) {
        res.status(404);
        throw new Error(`Project not found with id of ${req.params.id}`);
    }

    // Check access right here (omitted for brevity, assume middleware handles basic role-check)

    res.status(200).json({
        success: true,
        data: project
    });
});

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Manager+)
exports.createProject = asyncHandler(async (req, res) => {
    // Add user to req.body
    req.body.manager = req.user.id;
    req.body.organization = req.user.organization;

    const project = await Project.create(req.body);

    const Notification = require('../models/Notification');

    // Notify manager (self)
    await Notification.create({
        recipient: req.user.id,
        sender: req.user.id,
        type: 'project_update',
        title: 'Project Created',
        message: `New project "${project.title}" has been successfully created.`,
        link: `/projects/${project._id}`
    });

    // Notify members
    if (req.body.members && req.body.members.length > 0) {
        for (const memberId of req.body.members) {
            if (memberId.toString() !== req.user.id.toString()) {
                await Notification.create({
                    recipient: memberId,
                    sender: req.user.id,
                    type: 'project_update',
                    title: 'Added to Project',
                    message: `You have been added to the project: ${project.title}`,
                    link: `/projects/${project._id}`
                });
            }
        }
    }

    res.status(201).json({
        success: true,
        data: project
    });
});

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = asyncHandler(async (req, res) => {
    let project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error(`Project not found with id of ${req.params.id}`);
    }

    // Make sure user is project owner or admin
    if (project.manager.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(403);
        throw new Error(`User ${req.user.id} is not authorized to update this project`);
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: project
    });
});

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
        res.status(404);
        throw new Error(`Project not found with id of ${req.params.id}`);
    }

    // Make sure user is admin (PMs cannot delete projects)
    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error(`User ${req.user.id} is not authorized to delete this project. Only admins can delete projects.`);
    }

    await project.deleteOne(); // Trigger pre-remove hooks if any

    res.status(200).json({
        success: true,
        data: {}
    });
});
