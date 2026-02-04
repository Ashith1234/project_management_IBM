const express = require('express');
const {
    getMilestones,
    getMilestone,
    createMilestone,
    updateMilestone,
    deleteMilestone
} = require('../controllers/milestone.controller');

const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router({ mergeParams: true });

router.use(protect);

router
    .route('/')
    .get(getMilestones)
    .post(authorize('admin', 'project_manager', 'team_lead'), createMilestone);

router
    .route('/:id')
    .get(getMilestone)
    .put(authorize('admin', 'project_manager', 'team_lead'), updateMilestone)
    .delete(authorize('admin', 'project_manager'), deleteMilestone);

module.exports = router;
