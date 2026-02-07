const express = require('express');
const {
    getProjectProgress,
    getTaskCompletionStats,
    getTimeUtilization,
    getOverdueStats
} = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/projects', getProjectProgress);
router.get('/tasks', getTaskCompletionStats);
router.get('/time', getTimeUtilization);
router.get('/overdue', getOverdueStats);

module.exports = router;
