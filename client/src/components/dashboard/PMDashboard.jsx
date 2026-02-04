import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AlertTriangle, Calendar, Layers, Activity, Plus, Clock, CheckCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

const PMDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await axios.get('/api/dashboard/pm');
            setStats(res.data.data);
        } catch (error) {
            console.error("Error fetching PM stats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    if (loading) return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-[400px] w-full" />
                <Skeleton className="h-[400px] w-full" />
            </div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Project Manager Overview</h2>
                    <p className="text-slate-500 mt-1 text-sm leading-none">Manage your team's initiatives and track delivery performance.</p>
                </div>
                <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100" onClick={() => navigate('/tasks/create')}>
                    <Plus className="w-4 h-4" />
                    New Task
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-indigo-100 bg-indigo-50/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-indigo-900">Project Progress</CardTitle>
                        <Layers className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-indigo-700">{stats.projects} Active</div>
                        <div className="mt-3 h-2 w-full rounded-full bg-indigo-100 overflow-hidden">
                            <div className="h-full rounded-full bg-indigo-600 animate-in slide-in-from-left duration-1000" style={{ width: `${stats.progressPercent}%` }} />
                        </div>
                        <p className="mt-2 text-xs font-medium text-indigo-600/80">{stats.progressPercent}% overall completion</p>
                    </CardContent>
                </Card>
                <Card className="border-rose-100 bg-rose-50/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-rose-900">Action Required</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-rose-600">{stats.overdueTasks}</div>
                        <p className="text-xs font-medium text-rose-600/80 mt-1">Overdue tasks across projects</p>
                    </CardContent>
                </Card>
                <Card className="border-emerald-100 bg-emerald-50/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-emerald-900">Efficiency Grade</CardTitle>
                        <Activity className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-700">A+</div>
                        <p className="text-xs font-medium text-emerald-600/80 mt-1 text-nowrap whitespace-nowrap overflow-hidden">Real-time tracking optimized</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2 border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-lg font-bold">Team Workload</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-full h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.workload}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="count"
                                    >
                                        {stats.workload.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-1 gap-3 w-full pb-4 md:pb-0">
                            {stats.workload.map((entry, index) => (
                                <div key={entry.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        <span className="text-sm font-medium text-slate-700">{entry.name}</span>
                                    </div>
                                    <Badge variant="secondary" className="font-bold">{entry.count} tasks</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-100 shadow-sm overflow-hidden flex flex-col">
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
                                                {new Date(notif.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                                    <Activity className="w-10 h-10 text-slate-200 mb-2" />
                                    <p className="text-sm font-semibold text-slate-400">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-100 shadow-sm overflow-hidden">
                <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                    <CardTitle className="text-lg font-bold">Portfolio Milestones</CardTitle>
                </CardHeader>
                <CardContent className="py-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-emerald-600">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-emerald-900">Completed</span>
                            </div>
                            <span className="text-2xl font-black text-emerald-600">{stats.milestones?.completed || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-amber-600">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-amber-900">InProgress</span>
                            </div>
                            <span className="text-2xl font-black text-amber-600">{stats.milestones?.pending || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-rose-50 rounded-xl border border-rose-100">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg text-rose-600">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-rose-900">Action Required</span>
                            </div>
                            <span className="text-2xl font-black text-rose-600">{stats.milestones?.overdue || 0}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PMDashboard;
