import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ClipboardCheck, Users, Zap, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

const TeamLeadDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            // Team Lead uses PM stats endpoint but with slightly different view logic
            const res = await axios.get('/api/dashboard/pm');
            setStats(res.data.data);
        } catch (error) {
            console.error("Error fetching team lead stats", error);
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
            <Skeleton className="h-[400px] w-full" />
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Team Lead Console</h2>
                    <p className="text-slate-500 mt-1 text-sm leading-none">Monitor squad performance and unblock development workflows.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold px-3 py-1">Squad Alpha</Badge>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-amber-100 bg-amber-50/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-amber-900">Overdue Tasks</CardTitle>
                        <Zap className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">{stats.overdueTasks}</div>
                        <p className="text-[10px] font-bold text-amber-700/70 uppercase tracking-tighter mt-1">Requires focus</p>
                    </CardContent>
                </Card>
                <Card className="border-indigo-100 bg-indigo-50/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-indigo-900">Pending Approvals</CardTitle>
                        <ClipboardCheck className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-indigo-700">{stats.pendingApprovals || 0}</div>
                        <p className="text-[10px] font-bold text-indigo-700/70 uppercase tracking-tighter mt-1">Timesheets / Issues</p>
                    </CardContent>
                </Card>
                <Card className="border-emerald-100 bg-emerald-50/20">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-emerald-900">Sprint Progress</CardTitle>
                        <Zap className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-700">{stats.progressPercent}%</div>
                        <p className="text-[10px] font-bold text-emerald-700/70 uppercase tracking-tighter mt-1">Current batch completion</p>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 bg-slate-50/50">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-700">Milestones</CardTitle>
                        <Clock className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">
                            {stats.milestones?.completed || 0}
                            <span className="text-slate-400 text-lg font-medium ml-1">/ {stats.milestones?.completed + stats.milestones?.pending || 0}</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-1">Achieved recently</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-7">
                <Card className="col-span-4 border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-lg font-bold">Member Contribution (Active Tasks)</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.workload}>
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
                                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: '#64748b' }} />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={45} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications Panel */}
                <Card className="col-span-3 border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-lg font-bold">Team Activity</CardTitle>
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
                                    <Clock className="w-10 h-10 text-slate-200 mb-2" />
                                    <p className="text-sm font-semibold text-slate-400">Steady state</p>
                                    <p className="text-xs text-slate-500 mt-1">No recent team alerts.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TeamLeadDashboard;
