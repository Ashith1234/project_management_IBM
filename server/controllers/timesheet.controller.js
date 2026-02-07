const asyncHandler = require('express-async-handler');
const Timesheet = require('../models/Timesheet');
const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc      Get all timesheets for logged in user
// @route     GET /api/timesheets
// @access    Private
exports.getTimesheets = asyncHandler(async (req, res) => {
    const timesheets = await Timesheet.find({ user: req.user.id })
        .populate({
            path: 'project',
            select: 'title key'
        })
        .populate({
            path: 'task',
            select: 'title status'
        })
        .sort('-date');

    res.status(200).json({
        success: true,
        count: timesheets.length,
        data: timesheets
    });
});

// @desc      Create new timesheet entry
// @route     POST /api/timesheets
// @access    Private
exports.createTimesheet = asyncHandler(async (req, res) => {
    req.body.user = req.user.id;

    // Check if project exists
    const project = await Project.findById(req.body.project);
    if (!project) {
        res.status(404);
        throw new Error('Project not found');
    }

    // If task is provided, check if it exists and belongs to the project
    if (req.body.task) {
        const task = await Task.findById(req.body.task);
        if (!task) {
            res.status(404);
            throw new Error('Task not found');
        }
        if (task.project.toString() !== req.body.project) {
            res.status(400);
            throw new Error('Task does not belong to the selected project');
        }
    }

    const timesheet = await Timesheet.create(req.body);

    res.status(201).json({
        success: true,
        data: timesheet
    });
});

// @desc      Export timesheets to CSV
// @route     GET /api/timesheets/export
// @access    Private
exports.exportTimesheets = asyncHandler(async (req, res) => {
    const timesheets = await Timesheet.find({ user: req.user.id })
        .populate('project', 'title')
        .populate('task', 'title')
        .sort('-date');

    let csv = 'Date,Project,Task,Hours,Status,Description\n';

    timesheets.forEach(ts => {
        const date = new Date(ts.date).toLocaleDateString();
        const project = ts.project ? ts.project.title.replace(/,/g, ' ') : 'N/A';
        const task = ts.task ? ts.task.title.replace(/,/g, ' ') : 'N/A';
        const hours = ts.hours;
        const status = ts.status;
        const description = ts.description ? ts.description.replace(/,/g, ' ').replace(/\n/g, ' ') : '';

        csv += `${date},${project},${task},${hours},${status},${description}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`timesheets-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
});
