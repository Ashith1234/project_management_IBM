const express = require('express');
const { getDiscussions, sendMessage } = require('../controllers/discussion.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getDiscussions)
    .post(sendMessage);

module.exports = router;
