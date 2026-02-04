const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const Milestone = require('../models/Milestone');
const Timesheet = require('../models/Timesheet');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/dashboard/admin
// @access  Private/Admin
exports.getAdminStats = asyncHandler(async (req, res) => {
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({ status: 'active' });
    const completedProjects = await Project.countDocuments({ status: 'completed' });

    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Health: % on track (active projects without overdue tasks)
    // Simplified: % of non-completed tasks that are not overdue
    const now = new Date();
    const totalNonCompletedTasks = await Task.countDocuments({ status: { $ne: 'done' } });
    const overdueTasks = await Task.countDocuments({
        status: { $ne: 'done' },
        dueDate: { $lt: now }
    });

    const onTrackPercent = totalNonCompletedTasks > 0
        ? Math.round(((totalNonCompletedTasks - overdueTasks) / totalNonCompletedTasks) * 100)
        : 100;

    // Milestones Status
    const milestones = await Milestone.find();
    const milestoneStats = {
        completed: milestones.filter(m => m.status === 'completed').length,
        pending: milestones.filter(m => m.status === 'upcoming' || m.status === 'active').length,
        overdue: milestones.filter(m => m.status === 'overdue').length
    };

    // Notifications for Admin
    const Notification = require('../models/Notification');
    const notifications = await Notification.find({ recipient: req.user.id })
        .sort('-createdAt')
        .limit(10);

    res.status(200).json({
        success: true,
        data: {
            projects: { total: totalProjects, active: activeProjects, completed: completedProjects },
            users: { total: totalUsers, byRole: usersByRole },
            health: { onTrackPercent, overdueTasks },
            milestones: milestoneStats,
            notifications
        }
    });
});

// @desc    Get PM Dashboard Stats
// @route   GET /api/dashboard/pm
// @access  Private
exports.getPMStats = asyncHandler(async (req, res) => {
    // Projects where user is manager or member
    const projects = await Project.find({
        $or: [
            { manager: req.user.id },
            { members: req.user.id }
        ]
    });
    const projectIds = projects.map(p => p._id);

    const totalTasks = await Task.countDocuments({ project: { $in: projectIds } });
    const completedTasks = await Task.countDocuments({ project: { $in: projectIds }, status: 'done' });
    const overdueTasks = await Task.countDocuments({
        project: { $in: projectIds },
        status: { $ne: 'done' },
        dueDate: { $lt: new Date() }
    });

    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Team Workload: Tasks per user in these projects
    const workload = await Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $unwind: '$assignees' },
        { $group: { _id: '$assignees', taskCount: { $sum: 1 } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' },
        { $project: { name: '$user.name', count: '$taskCount' } }
    ]);

    // Milestones Status
    const milestones = await Milestone.find({ project: { $in: projectIds } });
    const milestoneStats = {
        completed: milestones.filter(m => m.status === 'completed').length,
        pending: milestones.filter(m => m.status === 'upcoming' || m.status === 'active').length,
        overdue: milestones.filter(m => m.status === 'overdue').length
    };

    // Pending Approvals (Team Lead / PM context)
    const pendingApprovals = await Timesheet.countDocuments({
        project: { $in: projectIds },
        status: 'submitted'
    });

    // Notifications
    const Notification = require('../models/Notification');
    const notifications = await Notification.find({ recipient: req.user.id })
        .sort('-createdAt')
        .limit(10);

    res.status(200).json({
        success: true,
        data: {
            projects: projects.length,
            progressPercent,
            overdueTasks,
            workload,
            milestones: milestoneStats,
            pendingApprovals,
            notifications
        }
    });
});

// @desc    Get Member Dashboard Stats
// @route   GET /api/dashboard/member
// @access  Private
exports.getMemberStats = asyncHandler(async (req, res) => {
    const assignedTasks = await Task.find({ assignees: req.user.id })
        .populate('project', 'title')
        .sort('dueDate');

    const totalTasks = assignedTasks.length;
    const completedTasksNum = assignedTasks.filter(t => t.status === 'done').length;

    const overdueTasks = assignedTasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < new Date());
    const upcomingDeadlines = assignedTasks.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) >= new Date());

    // Mock logged hours for now (logic should come from a Timesheet model)
    const loggedHours = assignedTasks.reduce((acc, task) => acc + (task.actualHours || 0), 0);

    // Notifications
    const Notification = require('../models/Notification');
    const notifications = await Notification.find({ recipient: req.user.id })
        .sort('-createdAt')
        .limit(10);

    res.status(200).json({
        success: true,
        data: {
            totalTasks,
            completedTasksNum,
            overdueTasks: overdueTasks.length,
            upcomingDeadlines: upcomingDeadlines.slice(0, 5),
            loggedHours,
            notifications
        }
    });
});
