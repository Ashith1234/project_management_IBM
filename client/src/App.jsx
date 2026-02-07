import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { DashboardLayout, AuthLayout } from './components/layout/Layouts';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Projects from './pages/projects/Projects';
import CreateProject from './pages/projects/CreateProject';
import ProjectDetails from './pages/projects/ProjectDetails';
import Tasks from './pages/tasks/Tasks';
import CreateTask from './pages/tasks/CreateTask';
import TaskDetail from './pages/tasks/TaskDetail';
import Timesheets from './pages/timesheets/Timesheets';
import Analytics from './pages/analytics/Analytics';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Toaster position="top-right" />
                <Routes>
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Route>

                    <Route element={<DashboardLayout />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/projects/create" element={<CreateProject />} />
                        <Route path="/projects/:id" element={<ProjectDetails />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/tasks/create" element={<CreateTask />} />
                        <Route path="/tasks/create/:projectId" element={<CreateTask />} />
                        <Route path="/tasks/:id" element={<TaskDetail />} />
                        <Route path="/timesheets" element={<Timesheets />} />
                        <Route path="/analytics" element={<Analytics />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
