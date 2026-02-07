const express = require('express');
const {
    getTimesheets,
    createTimesheet,
    exportTimesheets
} = require('../controllers/timesheet.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getTimesheets)
    .post(createTimesheet);

router.get('/export', exportTimesheets);

module.exports = router;
