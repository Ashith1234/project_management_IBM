const asyncHandler = require('express-async-handler');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Timesheet = require('../models/Timesheet');

// @desc      Get Project Progress Stats
// @route     GET /api/analytics/projects
// @access    Private
exports.getProjectProgress = asyncHandler(async (req, res) => {
    // Filter by organization
    const orgId = req.user.organization;

    const projects = await Project.find({ organization: orgId }).select('name status startDate endDate');

    // Calculate progress for each project based on tasks
    const projectProgress = await Promise.all(projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({ project: project._id });
        const completedTasks = await Task.countDocuments({ project: project._id, status: 'completed' });

        const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

        return {
            id: project._id,
            name: project.name,
            progress,
            status: project.status,
            totalTasks,
            completedTasks
        };
    }));

    res.status(200).json({
        success: true,
        data: projectProgress
    });
});

// @desc      Get Task Completion Stats
// @route     GET /api/analytics/tasks
// @access    Private
exports.getTaskCompletionStats = asyncHandler(async (req, res) => {
    const orgId = req.user.organization;

    // Aggregation to get count of tasks by status
    const stats = await Task.aggregate([
        // Match tasks belonging to projects in user's organization (slightly complex if tasks don't have direct org ref, usually they do via project)
        // Assuming we want all tasks visible to the user. For simplicty let's rely on project lookup or user role.
        // For now, let's look up all tasks where project belongs to org.
        {
            $lookup: {
                from: 'projects',
                localField: 'project',
                foreignField: '_id',
                as: 'projectData'
            }
        },
        {
            $match: {
                'projectData.organization': orgId
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    const formattedStats = {
        todo: 0,
        'in-progress': 0,
        review: 0,
        completed: 0
    };

    stats.forEach(stat => {
        if (formattedStats.hasOwnProperty(stat._id)) {
            formattedStats[stat._id] = stat.count;
        }
    });

    res.status(200).json({
        success: true,
        data: formattedStats
    });
});

// @desc      Get Time Utilization Reports
// @route     GET /api/analytics/time
// @access    Private
exports.getTimeUtilization = asyncHandler(async (req, res) => {
    const orgId = req.user.organization;

    // This is a bit more complex, need to sum actual hours from timesheets and compare with estimated hours from tasks? 
    // Or just show hours logged by user.
    // Let's go with "Estimated vs Actual" per project for now as per requirement "Estimated hours vs actual hours".

    const projects = await Project.find({ organization: orgId });

    const timeStats = await Promise.all(projects.map(async (project) => {
        // Get all tasks for this project to sum estimated hours
        const tasks = await Task.aggregate([
            { $match: { project: project._id } },
            { $group: { _id: null, totalEstimated: { $sum: "$estimatedHours" } } }
        ]);

        const estimated = tasks.length > 0 ? tasks[0].totalEstimated : 0;

        // Get all timesheets for this project to sum actual hours
        const timesheets = await Timesheet.aggregate([
            { $match: { project: project._id } },
            { $group: { _id: null, totalActual: { $sum: "$hours" } } }
        ]);

        const actual = timesheets.length > 0 ? timesheets[0].totalActual : 0;

        return {
            name: project.name,
            estimated,
            actual
        };
    }));

    res.status(200).json({
        success: true,
        data: timeStats
    });
});

// @desc      Get Overdue vs Completed Tasks
// @route     GET /api/analytics/overdue
// @access    Private
exports.getOverdueStats = asyncHandler(async (req, res) => {
    const orgId = req.user.organization;
    const today = new Date();

    const stats = await Task.aggregate([
        {
            $lookup: {
                from: 'projects',
                localField: 'project',
                foreignField: '_id',
                as: 'projectData'
            }
        },
        {
            $match: {
                'projectData.organization': orgId
            }
        },
        {
            $facet: {
                totalCompleted: [
                    { $match: { status: 'completed' } },
                    { $count: 'count' }
                ],
                totalOverdue: [
                    {
                        $match: {
                            status: { $ne: 'completed' },
                            dueDate: { $lt: today }
                        }
                    },
                    { $count: 'count' }
                ]
            }
        }
    ]);

    const completed = stats[0].totalCompleted[0] ? stats[0].totalCompleted[0].count : 0;
    const overdue = stats[0].totalOverdue[0] ? stats[0].totalOverdue[0].count : 0;

    res.status(200).json({
        success: true,
        data: {
            completed,
            overdue
        }
    });
});
