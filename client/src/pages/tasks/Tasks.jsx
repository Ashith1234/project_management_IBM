import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Plus, Search, Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Tasks = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/tasks');
            setTasks(res.data.data);
        } catch (error) {
            console.error("Error fetching tasks", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);


    const getPriorityVariant = (priority) => {
        switch (priority) {
            case 'high': return 'destructive';
            case 'medium': return 'warning';
            case 'low': return 'secondary';
            default: return 'outline';
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'done': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
            case 'todo': return <AlertTriangle className="w-4 h-4 text-slate-400" />;
            default: return null;
        }
    }

    const [filters, setFilters] = useState({ search: '', status: '', priority: '' });

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(filters.search.toLowerCase());
        const matchesStatus = filters.status === '' || task.status === filters.status;
        const matchesPriority = filters.priority === '' || task.priority === filters.priority;
        return matchesSearch && matchesStatus && matchesPriority;
    });

    const isOverdue = (date, status) => {
        if (!date || status === 'done') return false;
        return new Date(date) < new Date();
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">Task Board</h2>
                    <p className="text-slate-500 mt-1">Track and manage your team's workflow efficiency.</p>
                </div>
                {['admin', 'project_manager', 'team_lead'].includes(user?.role) && (
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={() => navigate('/tasks/create')}>
                        <Plus className="w-4 h-4" />
                        New Task
                    </Button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 flex-1">
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                className="w-full pl-10 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            />
                        </div>
                        <select
                            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 focus:ring-2 focus:ring-indigo-500"
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                            <option value="">All Status</option>
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                        </select>
                        <select
                            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 focus:ring-2 focus:ring-indigo-500"
                            value={filters.priority}
                            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                        >
                            <option value="">All Priority</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                </div>

                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="w-100">Task Name</TableHead>
                            <TableHead>Project</TableHead>
                            <TableHead>Assignee</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-5 w-20 ml-auto rounded-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : filteredTasks.length > 0 ? (
                            filteredTasks.map((task) => (
                                <TableRow
                                    key={task._id}
                                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                                    onClick={() => navigate(`/tasks/${task._id}`)}
                                >
                                    <TableCell className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">
                                        <div className="flex flex-col">
                                            <span>{task.title}</span>
                                            {isOverdue(task.dueDate, task.status) && (
                                                <span className="text-[10px] text-rose-500 font-bold flex items-center gap-1 mt-0.5">
                                                    <AlertTriangle className="w-3 h-3" /> Overdue
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-normal text-[10px] uppercase tracking-wider">
                                            {task.project?.title || 'Unassigned'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5">
                                            <div className="flex -space-x-2">
                                                {task.assignees?.slice(0, 3).map((a, i) => (
                                                    <Avatar key={i} className="w-6 h-6 border-2 border-white">
                                                        <AvatarFallback className="bg-indigo-100 text-indigo-700 text-[8px] font-bold">
                                                            {a.name?.charAt(0)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                ))}
                                                {task.assignees?.length > 3 && (
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-500">
                                                        +{task.assignees.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            {task.assignees?.length === 0 && (
                                                <span className="text-[10px] text-slate-400">Unassigned</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getPriorityVariant(task.priority)} className="capitalize">
                                            {task.priority || 'medium'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className={`text-xs text-nowrap ${isOverdue(task.dueDate, task.status) ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2 text-xs font-medium text-slate-600 whitespace-nowrap">
                                            {getStatusIcon(task.status)}
                                            <span className="capitalize">{task.status.replace('_', ' ')}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                                    <div className="flex flex-col items-center gap-2">
                                        <CheckCircle2 className="w-8 h-8 text-slate-200" />
                                        <p>Clean slate! No tasks found.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default Tasks;
