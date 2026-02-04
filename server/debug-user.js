const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/database');

dotenv.config();

const checkUser = async () => {
    await connectDB();
    const user = await User.findOne({ email: 'admin@demo.com' }).select('+password');
    if (user) {
        console.log('User found:', user.email);
        console.log('Role:', user.role);
        console.log('Password hash:', user.password);
    } else {
        console.log('User not found');
    }
    process.exit();
};

checkUser();
