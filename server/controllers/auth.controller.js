const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Organization = require('../models/Organization');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc      Register user
// @route     POST /api/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res) => {
    const { name, email, password, organizationName } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create organization if provided (for first user/admin)
    let organization;
    if (organizationName) {
        organization = await Organization.create({
            name: organizationName,
            owner: new mongoose.Types.ObjectId() // Placeholder, will update after user creation
        });
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: organizationName ? 'admin' : 'member', // First user is admin if org name provided
        organization: organization ? organization._id : undefined
    });

    // Update org owner if created
    if (organization) {
        organization.owner = user._id;
        await organization.save();
    }

    sendTokenResponse(user, 200, res);
});

// @desc      Login user
// @route     POST /api/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate emil & password
    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide an email and password');
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    sendTokenResponse(user, 200, res);
});

// @desc      Google login
// @route     POST /api/auth/google
// @access    Public
exports.googleLogin = asyncHandler(async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        res.status(400);
        throw new Error('Google credential is required');
    }

    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    const { name, email, picture, sub } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
        // Create user if doesn't exist
        user = await User.create({
            name,
            email,
            avatar: picture,
            password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10), // Random password
            role: 'member'
        });
    } else {
        // Update avatar if changed
        if (picture && user.avatar !== picture) {
            user.avatar = picture;
            await user.save();
        }
    }

    sendTokenResponse(user, 200, res);
});

// @desc      Get current logged in user
// @route     GET /api/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).populate('organization');

    res.status(200).json({
        success: true,
        data: user
    });
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });

    const options = {
        expires: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
        ),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organization: user.organization,
                avatar: user.avatar
            }
        });
};

