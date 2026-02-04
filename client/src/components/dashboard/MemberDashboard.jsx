import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { Clock, CheckSquare, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

const MemberDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const res = await axios.get('/api/dashboard/member');
            setStats(res.data.data);
        } catch (error) {
            console.error("Error fetching member stats", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    if (loading) return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
            </div>
            <Skeleton className="h-64 w-full" />
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">My Workspace</h2>
                    <p className="text-slate-500 mt-1 text-sm leading-none">Focus on your active tasks and team updates.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">SLA 99.9%</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-indigo-50 border-indigo-100 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-indigo-900 text-sm font-bold">Assigned Tasks</CardTitle>
                        <CheckSquare className="h-4 w-4 text-indigo-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-indigo-700">{stats.totalTasks}</div>
                        <p className="text-xs font-medium text-indigo-600 mt-1">{stats.completedTasksNum} successfully delivered</p>
                    </CardContent>
                </Card>
                <Card className="bg-rose-50 border-rose-100 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-rose-900 text-sm font-bold">Action Required</CardTitle>
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-rose-700">{stats.overdueTasks}</div>
                        <p className="text-xs font-medium text-rose-600 mt-1">Overdue items need focus</p>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-50 border-emerald-100 hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-emerald-900 text-sm font-bold">Effort Logged</CardTitle>
                        <Clock className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-emerald-700">{stats.loggedHours}h</div>
                        <p className="text-xs font-medium text-emerald-600 mt-1">Total recognized effort</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
                <Card className="lg:col-span-3 border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-lg font-bold">Upcoming Deadlines</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-slate-50/20">
                                <TableRow>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-wider pl-6">Task</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">Project</TableHead>
                                    <TableHead className="text-[10px] font-bold uppercase tracking-wider pr-6 text-right">Due Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stats.upcomingDeadlines.length > 0 ? stats.upcomingDeadlines.map((task) => (
                                    <TableRow key={task._id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="font-bold text-xs pl-6 py-4">{task.title}</TableCell>
                                        <TableCell className="text-xs">
                                            <Badge variant="secondary" className="font-normal text-[10px]">{task.project?.title}</Badge>
                                        </TableCell>
                                        <TableCell className="text-xs pr-6 text-right font-medium text-slate-500">
                                            {new Date(task.dueDate).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-20 px-6">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="p-3 bg-slate-50 rounded-full mb-2">
                                                    <CheckSquare className="w-8 h-8 text-slate-200" />
                                                </div>
                                                <p className="text-slate-900 text-sm font-bold">All caught up!</p>
                                                <p className="text-slate-500 text-xs">No pending deadlines for now.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <CardHeader className="border-b border-slate-50 bg-slate-50/30">
                        <CardTitle className="text-lg font-bold">Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex-1 overflow-auto max-h-[450px]">
                        <div className="divide-y divide-slate-100">
                            {stats.notifications?.length > 0 ? stats.notifications.map((notif) => (
                                <div key={notif._id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                                    <div className="flex gap-3">
                                        <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${notif.isRead ? 'bg-slate-200' : 'bg-indigo-600 shadow-sm shadow-indigo-200'}`} />
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{notif.title}</p>
                                            <p className="text-[10px] text-slate-600 leading-normal line-clamp-2">{notif.message}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{new Date(notif.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
                                    <div className="p-3 bg-slate-50 rounded-full mb-3">
                                        <AlertCircle className="w-8 h-8 text-slate-200" />
                                    </div>
                                    <p className="text-slate-900 text-sm font-bold">No new alerts</p>
                                    <p className="text-slate-500 text-xs mt-1">Updates on your tasks will appear here.</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MemberDashboard;
