const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Project = require('../models/Project');
const Task = require('../models/Task');
const connectDB = require('../config/database');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await User.deleteMany();
        await Organization.deleteMany();
        await Project.deleteMany();
        await Task.deleteMany();

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@demo.com',
            password: 'password123',
            role: 'admin'
        });

        const org = await Organization.create({
            name: 'Demo Corp',
            owner: admin._id,
            subscription: { plan: 'pro', status: 'active' }
        });

        // Update admin with org
        admin.organization = org._id;
        await admin.save();

        const manager = await User.create({
            name: 'John Manager',
            email: 'manager@demo.com',
            password: 'password123',
            role: 'project_manager',
            organization: org._id
        });

        const lead = await User.create({
            name: 'Sarah Lead',
            email: 'lead@demo.com',
            password: 'password123',
            role: 'team_lead',
            organization: org._id
        });

        const member = await User.create({
            name: 'Jane Member',
            email: 'member@demo.com',
            password: 'password123',
            role: 'member',
            organization: org._id
        });

        const project1 = await Project.create({
            title: 'Website Redesign',
            description: 'Overhaul the company website with modern design.',
            status: 'active',
            manager: manager._id,
            organization: org._id,
            members: [manager._id, member._id],
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 2))
        });

        const project2 = await Project.create({
            title: 'Mobile App Support',
            description: 'Maintenance for the iOS and Android apps.',
            status: 'planning',
            manager: manager._id,
            organization: org._id,
            members: [manager._id],
            startDate: new Date()
        });

        await Task.create({
            title: 'Design Home Page',
            description: 'Create Figma mockups for the new home page.',
            project: project1._id,
            status: 'in_progress',
            priority: 'high',
            reporter: manager._id,
            assignees: [member._id],
            dueDate: new Date(new Date().setDate(new Date().getDate() + 5))
        });

        await Task.create({
            title: 'Setup React Repo',
            description: 'Initialize the repo with Vite and Tailwind.',
            project: project1._id,
            status: 'done',
            priority: 'medium',
            reporter: manager._id,
            assignees: [member._id],
            dueDate: new Date()
        });

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    // destroyData();
} else {
    importData();
}
