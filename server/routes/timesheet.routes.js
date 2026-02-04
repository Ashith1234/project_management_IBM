const express = require('express');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.get('/', (req, res) => res.json({ msg: 'Timesheets route' }));

module.exports = router;
