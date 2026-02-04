const express = require('express');
const {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject
} = require('../controllers/project.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

// Include other resource routers
const taskRouter = require('./task.routes');
const milestoneRouter = require('./milestone.routes');

const router = express.Router();

// Re-route into other resource routers
router.use('/:projectId/milestones', milestoneRouter);

router.use(protect);

router
    .route('/')
    .get(getProjects)
    .post(authorize('admin', 'project_manager', 'team_lead'), createProject);

router
    .route('/:id')
    .get(getProject)
    .put(authorize('admin', 'project_manager', 'team_lead'), updateProject)
    .delete(authorize('admin', 'project_manager'), deleteProject);

module.exports = router;
