import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import {
    LayoutDashboard,
    Briefcase,
    CheckSquare,
    Clock,
    LogOut,
    Menu,
    Bell,
    BarChart2
} from 'lucide-react';
import { useState, useEffect } from 'react';

export const DashboardLayout = () => {
    const { isAuthenticated, loading, user, logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnreadCount = async () => {
        try {
            const res = await axios.get('/api/notifications/unread-count');
            setUnreadCount(res.data.data);
        } catch (error) {
            console.error("Error fetching unread count", error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000); // Polling every 30s
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const navItems = [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Projects', path: '/projects', icon: Briefcase },
        { label: 'Tasks', path: '/tasks', icon: CheckSquare },
        { label: 'Timesheets', path: '/timesheets', icon: Clock },
        { label: 'Analytics', path: '/analytics', icon: BarChart2 },
    ];

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar remains the same */}
            <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
                <div className="p-6 font-bold text-2xl flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">P</div>
                    <span>ProManage</span>
                </div>
                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 py-2.5 px-4 rounded-lg transition-colors ${location.pathname === item.path
                                ? 'bg-indigo-600 text-white'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full py-2.5 px-4 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 text-slate-500" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-lg font-semibold text-slate-900 capitalize">
                            {location.pathname.split('/')[1] || 'Dashboard'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative group transition-colors">
                            <Bell className="w-5 h-5 group-hover:text-indigo-600 transition-colors" />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center px-1 animate-in zoom-in duration-300">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Link>
                        <div className="h-8 w-px bg-slate-200 mx-1"></div>
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-slate-900 leading-none">{user?.name}</p>
                                <p className="text-xs text-slate-500 mt-1 capitalize">{user?.role?.replace('_', ' ')}</p>
                            </div>
                            <Avatar>
                                <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                                    {user?.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export const AuthLayout = () => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
            <div className="mb-8 font-bold text-3xl flex items-center gap-2 text-slate-900 font-outfit">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">P</div>
                <span>ProManage</span>
            </div>
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
