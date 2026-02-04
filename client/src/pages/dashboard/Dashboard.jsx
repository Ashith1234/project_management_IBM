import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import PMDashboard from '@/components/dashboard/PMDashboard';
import MemberDashboard from '@/components/dashboard/MemberDashboard';
import TeamLeadDashboard from '@/components/dashboard/TeamLeadDashboard';

const Dashboard = () => {
    const { user, loading: authLoading } = useAuth();

    if (authLoading) return <div className="p-8 text-center text-slate-500">Authenticating...</div>;

    if (!user) {
        return <div className="p-8 text-center text-slate-500">Please log in to view your dashboard.</div>;
    }

    switch (user.role) {
        case 'admin':
            return <AdminDashboard />;
        case 'project_manager':
            return <PMDashboard />;
        case 'team_lead':
            return <TeamLeadDashboard />;
        case 'member':
            return <MemberDashboard />;
        default:
            return <MemberDashboard />;
    }
};

export default Dashboard;
