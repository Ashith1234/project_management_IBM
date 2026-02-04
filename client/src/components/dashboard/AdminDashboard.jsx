import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Briefcase, CheckCircle, Activity, Calendar, Plus } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await axios.get('/api/dashboard/admin');
            setStats(res.data.data);
        } catch (error) {
            console.error("Error fetching admin stats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
            </div>
            <div className="grid gap-4 md:grid-cols-7">
                <Skeleton className="col-span-4 h-[400px]" />
                <Skeleton className="col-span-3 h-[400px]" />
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Admin Console</h2>
                    <p className="text-slate-500 mt-1 text-sm leading-none">System-wide monitoring and organization management.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="hidden sm:flex" onClick={() => navigate('/projects')}>View Projects</Button>
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200" onClick={() => navigate('/projects/create')}>
                        <Plus className="w-4 h-4" />
                        Create Project
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-600">Total Projects</CardTitle>
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <Briefcase className="h-4 w-4 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{stats.projects.total}</div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">{stats.projects.active} currently active</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-600">Completed</CardTitle>
                        <div className="p-2 bg-emerald-50 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{stats.projects.completed}</div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Across all teams</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-600">User Growth</CardTitle>
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Users className="h-4 w-4 text-blue-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{stats.users.total}</div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Verified members</p>
                    </CardContent>
                </Card>
                <Card className="hover:shadow-md transition-shadow border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-600">Risk Factor</CardTitle>
                        <div className="p-2 bg-rose-50 rounded-lg">
                            <Activity className="h-4 w-4 text-rose-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-rose-600">{stats.health.overdueTasks}</div>
                        <p className="text-xs text-slate-500 mt-1 font-medium">Critical overdue tasks</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                {/* Users by Role Chart */}
                <Card className="col-span-4 border-slate-100 shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-lg font-bold">User Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.users.byRole}>
                                    <XAxis dataKey="_id" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
                                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications Panel */}
                <Card className="col-span-3 border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-lg font-bold">Recent Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-auto max-h-[350px]">
                        <div className="divide-y divide-slate-100">
                            {stats.notifications?.length > 0 ? stats.notifications.map((notif) => (
                                <div key={notif._id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className="flex gap-3">
                                        <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.isRead ? 'bg-slate-300' : 'bg-indigo-600'}`} />
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{notif.title}</p>
                                            <p className="text-[10px] text-slate-600 leading-normal line-clamp-2">{notif.message}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">
                                                {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                                    <Activity className="w-10 h-10 text-slate-200 mb-2" />
                                    <p className="text-sm font-semibold text-slate-400">No recent activity</p>
                                    <p className="text-xs text-slate-500 mt-1">Notifications will appear here as the team works.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Milestone Status Card */}
            {stats.milestones && (
                <Card className="border-slate-100 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Calendar className="w-5 h-5 text-indigo-500" />
                            Portfolio Milestones
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                <div className="text-3xl font-bold text-emerald-600">{stats.milestones.completed}</div>
                                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mt-1">Completed</p>
                            </div>
                            <div className="text-center p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                                <div className="text-3xl font-bold text-amber-600">{stats.milestones.pending}</div>
                                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mt-1">In Progress</p>
                            </div>
                            <div className="text-center p-4 bg-rose-50/50 rounded-xl border border-rose-100">
                                <div className="text-3xl font-bold text-rose-600">{stats.milestones.overdue}</div>
                                <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mt-1">Overdue</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

        </div>
    );
};

export default AdminDashboard;
