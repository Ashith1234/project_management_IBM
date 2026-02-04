const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get all users
// @route   GET /api/users
// @access  Private
exports.getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('name email role');

    res.status(200).json({
        success: true,
        count: users.length,
        data: users
    });
});
