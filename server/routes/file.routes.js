const express = require('express');
const { getFiles, uploadFile, deleteFile, uploadMiddleware } = require('../controllers/file.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getFiles)
    .post(uploadMiddleware, uploadFile);

router.route('/:id')
    .delete(deleteFile);

module.exports = router;
