import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import {
    Calendar, CheckCircle2, Clock, MessageSquare,
    Paperclip, Plus, Trash2, Send, ArrowLeft, Layers
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

const TaskDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ title: '', description: '', priority: '', dueDate: '' });
    const [subtasks, setSubtasks] = useState([]);
    const [comment, setComment] = useState('');
    const [activeTab, setActiveTab] = useState('details');

    const fetchTaskDetails = async () => {
        setLoading(true);
        try {
            const [taskRes, subRes] = await Promise.all([
                axios.get(`/api/tasks/${id}`),
                axios.get(`/api/tasks?parentTask=${id}`)
            ]);
            setTask(taskRes.data.data);
            setSubtasks(subRes.data.data || []);
            setEditData({
                title: taskRes.data.data.title,
                description: taskRes.data.data.description,
                priority: taskRes.data.data.priority,
                dueDate: taskRes.data.data.dueDate ? new Date(taskRes.data.data.dueDate).toISOString().split('T')[0] : ''
            });
        } catch (error) {
            console.error("Error fetching task details", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTaskDetails();
    }, [id]);

    const handleSave = async () => {
        try {
            const res = await axios.put(`/api/tasks/${id}`, editData);
            setTask(res.data.data);
            setIsEditing(false);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to save changes");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            await axios.delete(`/api/tasks/${id}`);
            navigate('/tasks');
        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete task");
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            const res = await axios.put(`/api/tasks/${id}`, { status: newStatus });
            setTask(res.data.data);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to update status");
        }
    };

    const handleCreateSubtask = async () => {
        const title = window.prompt("Enter sub-task title:");
        if (!title) return;
        try {
            await axios.post('/api/tasks', {
                title,
                project: task.project._id,
                parentTask: task._id
            });
            fetchTaskDetails();
        } catch (error) {
            alert("Failed to create sub-task");
        }
    };

    const handlePostComment = async () => {
        if (!comment.trim()) return;
        try {
            await axios.put(`/api/tasks/${id}`, {
                $push: {
                    comments: {
                        text: comment,
                        user: task.reporter._id
                    }
                }
            });
            setComment('');
            fetchTaskDetails();
        } catch (error) {
            console.error("Error posting comment", error);
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto space-y-6">
                <Skeleton className="h-12 w-1/3" />
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (!task) {
        return (
            <div className="max-w-6xl mx-auto text-center py-20">
                <h2 className="text-2xl font-bold text-slate-900">Task Not Found</h2>
                <Button className="mt-4" onClick={() => navigate('/tasks')}>Back to Tasks</Button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Tasks
                    </Button>
                    <Badge variant={task.status === 'done' ? 'success' : 'outline'} className="capitalize">
                        {task.status.replace('_', ' ')}
                    </Badge>
                    {isEditing ? (
                        <input
                            className="text-2xl font-bold bg-slate-50 border border-slate-200 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={editData.title}
                            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        />
                    ) : (
                        <h1 className="text-3xl font-bold text-slate-900">{task.title}</h1>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <Button size="sm" onClick={handleSave}>Save</Button>
                    ) : (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(task.status === 'done' ? 'todo' : 'done')}>
                        {task.status === 'done' ? 'Reopen' : 'Mark as Done'}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={handleDelete}>
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</h4>
                        {isEditing ? (
                            <textarea
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                                value={editData.description}
                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            />
                        ) : (
                            <p className="text-slate-700 leading-relaxed text-sm">
                                {task.description || "No description provided."}
                            </p>
                        )}
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="bg-slate-50 w-full justify-start p-1 rounded-lg">
                            <TabsTrigger value="details">Sub-tasks</TabsTrigger>
                            <TabsTrigger value="comments">Comments ({task.comments?.length || 0})</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="pt-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sub-tasks ({subtasks.length})</h4>
                                <Button variant="ghost" size="sm" className="h-7 text-indigo-600 font-bold px-2 text-[10px]" onClick={handleCreateSubtask}>
                                    <Plus className="w-3.5 h-3.5 mr-1" /> Add
                                </Button>
                            </div>
                            <div className="space-y-2">
                                {subtasks.map(sub => (
                                    <div key={sub._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-4 w-4 border-2 rounded flex items-center justify-center ${sub.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                                                {sub.status === 'done' && <CheckCircle2 className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className={`text-sm ${sub.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                                                {sub.title}
                                            </span>
                                        </div>
                                        <Badge variant="outline" className="text-[10px] capitalize">{sub.status}</Badge>
                                    </div>
                                ))}
                                {subtasks.length === 0 && (
                                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                        <p className="text-sm text-slate-400">No sub-tasks yet.</p>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="comments" className="pt-4">
                            <div className="space-y-6">
                                {task.comments?.map((c, i) => (
                                    <div key={i} className="flex gap-4">
                                        <Avatar className="w-8 h-8">
                                            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                                                {c.user?.name?.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold text-slate-900">{c.user?.name}</span>
                                                <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-2xl rounded-tl-none border border-slate-100">
                                                {c.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex gap-4 pt-4 border-t border-slate-100">
                                    <Avatar className="w-8 h-8">
                                        <AvatarFallback className="bg-slate-200 text-slate-600 text-[10px] font-bold">Me</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 relative">
                                        <textarea
                                            className="w-full bg-slate-50 border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                                            placeholder="Add a comment..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />
                                        <Button
                                            size="sm"
                                            className="absolute bottom-2 right-2 rounded-full h-8 w-8 p-0"
                                            onClick={handlePostComment}
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="history" className="pt-4">
                            {task.history?.length > 0 ? (
                                <div className="space-y-4">
                                    {task.history.map((h, i) => (
                                        <div key={i} className="flex gap-3">
                                            <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2" />
                                            <div>
                                                <p className="text-sm text-slate-700">
                                                    <span className="font-bold">{h.user?.name}</span> {h.action}
                                                </p>
                                                <p className="text-xs text-slate-400">{new Date(h.timestamp).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic text-center py-10">No history available yet.</p>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Sidebar */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6 h-fit">
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Project</label>
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                <Layers className="w-4 h-4 text-indigo-500" />
                                {task.project?.title}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Assignees</label>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {task.assignees?.map(a => (
                                    <div key={a._id} className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-full border border-slate-200">
                                        <Avatar className="w-5 h-5">
                                            <AvatarFallback className="text-[8px] bg-slate-100">{a.name?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs font-medium">{a.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Priority</label>
                            <div className="pt-1">
                                {isEditing ? (
                                    <select
                                        className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-500"
                                        value={editData.priority}
                                        onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                ) : (
                                    <Badge variant={task.priority === 'high' || task.priority === 'critical' ? 'destructive' : task.priority === 'medium' ? 'warning' : 'secondary'} className="capitalize">
                                        {task.priority || 'medium'}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Due Date</label>
                            <div className="flex items-center gap-2 pt-1 text-sm font-semibold text-slate-700">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                {isEditing ? (
                                    <input
                                        type="date"
                                        className="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs focus:ring-2 focus:ring-indigo-500"
                                        value={editData.dueDate}
                                        onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                                    />
                                ) : (
                                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                        <p className="text-[10px] text-slate-400 text-center italic">
                            Created on {new Date(task.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailPage;
