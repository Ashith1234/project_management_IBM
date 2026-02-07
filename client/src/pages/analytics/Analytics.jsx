import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
    Download, Filter, Calendar, Users, Briefcase,
    CheckCircle, AlertCircle, Clock, TrendingUp, Search
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';
import {
    getProjectProgress,
    getTaskCompletionStats,
    getTimeUtilization,
    getOverdueStats
} from '@/api/analytics';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const Analytics = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [projectData, setProjectData] = useState([]);
    const [taskStats, setTaskStats] = useState([]);
    const [timeData, setTimeData] = useState([]);
    const [overdueData, setOverdueData] = useState(null);

    // Filters state
    const [filterProject, setFilterProject] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setIsLoading(true);
            const [projects, tasks, time, overdue] = await Promise.all([
                getProjectProgress(),
                getTaskCompletionStats(),
                getTimeUtilization(),
                getOverdueStats()
            ]);

            setProjectData(projects.data);

            // Format task stats for PieChart
            const formattedTasks = Object.keys(tasks.data).map(key => ({
                name: key.replace('-', ' ').toUpperCase(),
                value: tasks.data[key]
            }));
            setTaskStats(formattedTasks);

            setTimeData(time.data);
            setOverdueData(overdue.data);
        } catch (error) {
            toast.error('Failed to fetch analytics data');
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportCSV = () => {
        // Simple CSV generation for reports
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Project Name,Progress,Total Tasks,Completed Tasks\n";
        projectData.forEach(p => {
            csvContent += `${p.name},${p.progress}%,${p.totalTasks},${p.completedTasks}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "pm_analytics_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV Report exported');
    };

    const handleExportPDF = () => {
        toast.success('PDF Generation started... (Downloading layout)');
        window.print(); // Quick way to "export" via print to PDF
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium font-outfit">Preparing your report...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Analytics & Reports</h2>
                    <p className="text-slate-500 mt-1">Comprehensive view of your organization's performance.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" className="gap-2 h-11 px-5 border-slate-200" onClick={handleExportCSV}>
                        <Download className="w-4 h-4" />
                        Export CSV
                    </Button>
                    <Button className="gap-2 h-11 px-5 shadow-lg shadow-indigo-200" onClick={handleExportPDF}>
                        <Download className="w-4 h-4" />
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none shadow-xl shadow-indigo-100">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between opacity-80">
                            <span className="text-sm font-medium">Completed Tasks</span>
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-3xl font-bold">{overdueData?.completed || 0}</h3>
                            <p className="text-xs mt-1 text-indigo-100 flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +12% from last week
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm border-l-4 border-l-rose-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-sm font-medium">Overdue Tasks</span>
                            <AlertCircle className="w-5 h-5 text-rose-500" />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-3xl font-bold text-slate-900">{overdueData?.overdue || 0}</h3>
                            <p className="text-xs mt-1 text-rose-500 font-medium">Critical attention required</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-sm font-medium">Hours Logged</span>
                            <Clock className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-3xl font-bold text-slate-900">
                                {timeData.reduce((acc, curr) => acc + curr.actual, 0).toFixed(1)}h
                            </h3>
                            <p className="text-xs mt-1 text-emerald-600 font-medium flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> On track with estimates
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-200 shadow-sm border-l-4 border-l-amber-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-sm font-medium">Active Projects</span>
                            <Briefcase className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="mt-2">
                            <h3 className="text-3xl font-bold text-slate-900">{projectData.length}</h3>
                            <p className="text-xs mt-1 text-slate-400">Total running projects</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search reports by project or keyword..."
                        className="pl-10 border-slate-200 focus:ring-indigo-500 h-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <Select
                        placeholder="All Projects"
                        options={[
                            { label: 'All Projects', value: 'all' },
                            ...projectData.map(p => ({ label: p.name, value: p.id }))
                        ]}
                        value={filterProject}
                        onChange={setFilterProject}
                        className="h-10"
                    />
                </div>
                <Button variant="ghost" className="gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    Date Range
                </Button>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Project Progress */}
                <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-lg font-bold font-outfit flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-600" />
                            Project Progress Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={projectData.filter(p => searchTerm === '' || p.name.toLowerCase().includes(searchTerm.toLowerCase()))}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: '#f8fafc' }}
                                    />
                                    <Bar dataKey="progress" name="Completion %" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Task Distribution */}
                <Card className="border-slate-100 shadow-sm overflow-hidden bg-white">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                        <CardTitle className="text-lg font-bold font-outfit flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                            Task Completion Graphs
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8 flex flex-col items-center">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={taskStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {taskStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-4 w-full mt-4">
                            {taskStats.map((stat, i) => (
                                <div key={stat.name} className="flex flex-col p-3 rounded-lg border border-slate-50 bg-slate-50/30">
                                    <span className="text-xs text-slate-500 font-medium">{stat.name}</span>
                                    <span className="text-xl font-bold text-slate-900">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Time Utilization */}
                <Card className="border-slate-100 shadow-sm overflow-hidden bg-white lg:col-span-2">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-bold font-outfit flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-600" />
                            Time Utilization Reports
                        </CardTitle>
                        <div className="flex items-center gap-4 text-xs font-medium">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                                <span className="text-slate-500">Estimated Hours</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
                                <span className="text-slate-500">Actual Hours</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 px-6">
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={timeData}>
                                    <defs>
                                        <linearGradient id="colorEstimated" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Area type="monotone" dataKey="estimated" name="Estimated Hours" stroke="#f59e0b" fillOpacity={1} fill="url(#colorEstimated)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="actual" name="Actual Hours" stroke="#6366f1" fillOpacity={1} fill="url(#colorActual)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Analytics;
