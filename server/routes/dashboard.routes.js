const express = require('express');
const router = express.Router();
const { getAdminStats, getPMStats, getMemberStats } = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/admin', authorize('admin'), getAdminStats);
router.get('/pm', authorize('project_manager', 'admin', 'team_lead'), getPMStats);
router.get('/member', getMemberStats);

module.exports = router;
