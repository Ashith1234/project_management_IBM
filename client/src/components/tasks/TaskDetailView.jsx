import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter
} from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import {
    Calendar, CheckCircle2, Clock, MessageSquare,
    Paperclip, History, Plus, MoreHorizontal,
    ChevronRight, Trash2, Send, CornerDownRight,
    Layers, Upload, FileText, UserCircle2
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';

const TaskDetailView = ({ taskId, isOpen, onClose, onUpdate }) => {
    const { user } = useAuth();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ title: '', description: '', priority: '', dueDate: '' });
    const [subtasks, setSubtasks] = useState([]);
    const [comment, setComment] = useState('');
    const [activeTab, setActiveTab] = useState('details');
    const [replyTo, setReplyTo] = useState(null);

    // Determine permissions
    // Safe check: ensure user and task/project data are loaded before checking
    const canDelete = user?.role === 'admin' || (task?.project?.manager === user?._id || task?.project?.manager?._id === user?._id);
    const canEdit = canDelete; // Editing follows same rules: only Admin or Project Manager

    const fetchTaskDetails = async () => {
        setLoading(true);
        try {
            const [taskRes, subRes] = await Promise.all([
                axios.get(`/api/tasks/${taskId}`),
                axios.get(`/api/tasks?parentTask=${taskId}`)
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

    const handleSave = async () => {
        try {
            const res = await axios.put(`/api/tasks/${taskId}`, editData);
            setTask(res.data.data);
            setIsEditing(false);
            if (onUpdate) onUpdate();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to save changes");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;
        try {
            await axios.delete(`/api/tasks/${taskId}`);
            onClose();
            if (onUpdate) onUpdate();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete task");
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        try {
            const res = await axios.put(`/api/tasks/${taskId}`, { status: newStatus });
            setTask(res.data.data);
            if (onUpdate) onUpdate();
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
            await axios.put(`/api/tasks/${taskId}`, {
                $push: {
                    comments: {
                        text: comment,
                        user: user._id, // Use current user ID for comment
                        parentComment: replyTo?._id || null
                    }
                }
            });
            setComment('');
            setReplyTo(null);
            fetchTaskDetails();
        } catch (error) {
            console.error("Error posting comment", error);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 bg-white">
                {loading ? (
                    <div className="p-8 space-y-6">
                        <Skeleton className="h-8 w-1/3" />
                        <div className="grid grid-cols-3 gap-6">
                            <Skeleton className="h-24 col-span-2" />
                            <Skeleton className="h-24" />
                        </div>
                        <Skeleton className="h-64" />
                    </div>
                ) : !task ? (
                    <div className="p-8 text-center">Task Not Found</div>
                ) : (
                    <>
                        <DialogHeader className="p-6 border-b border-slate-100 flex flex-row items-center justify-between space-y-0 bg-white">
                            <div className="flex items-center gap-3 flex-1 mr-4">
                                <Badge variant={task.status === 'done' ? 'success' : 'outline'} className="capitalize shrink-0">
                                    {task.status.replace('_', ' ')}
                                </Badge>
                                {isEditing && canEdit ? (
                                    <input
                                        className="text-xl font-bold bg-slate-50 border border-slate-200 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={editData.title}
                                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    />
                                ) : (
                                    <DialogTitle className="text-xl font-bold truncate">{task.title}</DialogTitle>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {isEditing ? (
                                    <Button size="sm" onClick={handleSave}>Save</Button>
                                ) : (
                                    canEdit && <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
                                )}
                                <Button
                                    variant={task.status === 'done' ? 'outline' : 'default'}
                                    size="sm"
                                    className={task.status !== 'done' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}
                                    onClick={() => handleUpdateStatus(task.status === 'done' ? 'in_progress' : 'done')}
                                >
                                    {task.status === 'done' ? 'Reopen' : 'Work Done'}
                                </Button>
                                {canDelete && (
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-50" onClick={handleDelete}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </DialogHeader>

                        <div className="flex-1 overflow-auto bg-white">
                            <div className="grid grid-cols-3 gap-0">
                                {/* Left Content: Main Details */}
                                <div className="col-span-2 border-r border-slate-100 p-6 space-y-8">
                                    <div className="space-y-3">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Description</h4>
                                        {isEditing && canEdit ? (
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
                                            <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
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
                                                    <div key={sub._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-4 w-4 border-2 rounded flex items-center justify-center transition-colors ${sub.status === 'done' ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
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

                                        <TabsContent value="dependencies" className="pt-4 space-y-4">
                                            <h4 className="text-sm font-bold text-slate-800">Requires Completion Of:</h4>
                                            {task.dependencies?.length > 0 ? (
                                                <div className="space-y-2">
                                                    {task.dependencies.map(dep => (
                                                        <div key={dep._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                            <div className="flex items-center gap-3">
                                                                <Clock className="w-4 h-4 text-amber-500" />
                                                                <span className="text-sm font-medium">{dep.title}</span>
                                                            </div>
                                                            <Badge variant="outline" className="text-[10px]">{dep.status}</Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-slate-500 italic">No dependencies defined.</p>
                                            )}
                                        </TabsContent>

                                        <TabsContent value="comments" className="pt-4">
                                            <div className="space-y-6">
                                                {task.comments?.filter(c => !c.parentComment).map((c, i) => (
                                                    <div key={i} className="space-y-4">
                                                        <div className="flex gap-4">
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
                                                                <div className="flex items-center gap-4 mt-2 px-1">
                                                                    <button
                                                                        onClick={() => {
                                                                            setReplyTo(c);
                                                                            setComment(`@${c.user?.name} `);
                                                                        }}
                                                                        className="text-[10px] font-bold text-slate-500 hover:text-indigo-600"
                                                                    >
                                                                        Reply
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {/* Threaded Replies */}
                                                        {task.comments?.filter(r => r.parentComment === c._id).map((r, ri) => (
                                                            <div key={ri} className="flex gap-4 ml-12">
                                                                <Avatar className="w-6 h-6">
                                                                    <AvatarFallback className="bg-slate-100 text-slate-500 text-[8px] font-bold">
                                                                        {r.user?.name?.charAt(0)}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <span className="text-xs font-bold text-slate-900">{r.user?.name}</span>
                                                                        <span className="text-[9px] text-slate-400">{new Date(r.createdAt).toLocaleString()}</span>
                                                                    </div>
                                                                    <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl rounded-tl-none border border-slate-100">
                                                                        {r.text}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ))}

                                                <div className="flex gap-4 pt-4 border-t border-slate-100">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarFallback className="bg-slate-200 text-slate-600 text-[10px] font-bold">Me</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 relative">
                                                        {replyTo && (
                                                            <div className="absolute -top-6 left-0 right-0 flex items-center justify-between bg-indigo-50 px-3 py-1 rounded-t-lg border-x border-t border-indigo-100">
                                                                <span className="text-[10px] text-indigo-600 font-medium">Replying to {replyTo.user?.name}</span>
                                                                <button onClick={() => setReplyTo(null)} className="text-[10px] text-indigo-400 hover:text-indigo-600 font-bold">Cancel</button>
                                                            </div>
                                                        )}
                                                        <textarea
                                                            className={`w-full bg-slate-50 border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 min-h-[80px] ${replyTo ? 'rounded-tl-none' : ''}`}
                                                            placeholder="Add a comment... Use @ to mention someone"
                                                            value={comment}
                                                            onChange={(e) => setComment(e.target.value)}
                                                            readOnly={false} // Comments allowed for all
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
                                            <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                                                {task.history?.slice().reverse().map((h, i) => (
                                                    <div key={i} className="relative">
                                                        <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-white border-2 border-indigo-500 shadow-sm" />
                                                        <div className="space-y-1">
                                                            <p className="text-sm text-slate-700">
                                                                <span className="font-bold">{h.user?.name}</span>
                                                                {h.action === 'status_change' ? ' changed status to ' : ' updated '}
                                                                <Badge variant="secondary" className="font-bold text-[10px] mx-1">{h.newValue}</Badge>
                                                            </p>
                                                            <p className="text-[10px] text-slate-400">{new Date(h.timestamp).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {(!task.history || task.history.length === 0) && (
                                                    <p className="text-sm text-slate-500 italic text-center py-10">No history available yet.</p>
                                                )}
                                            </div>
                                        </TabsContent>
                                    </Tabs>
                                </div>

                                {/* Right sidebar: Metadata */}
                                <div className="p-6 space-y-8 bg-slate-50/30">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Project</label>
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                <Layers className="w-4 h-4 text-indigo-500" />
                                                {task.project?.title}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Assigned By</label>
                                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                                                <UserCircle2 className="w-4 h-4 text-indigo-500" />
                                                {task.reporter?.name || 'Unknown'}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Assigned To</label>
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {task.assignees?.map(a => (
                                                    <div key={a._id} className="flex items-center gap-2 bg-white px-2 py-1 rounded-full border border-slate-200">
                                                        <Avatar className="w-5 h-5">
                                                            <AvatarFallback className="text-[8px] bg-slate-100">{a.name?.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs font-medium">{a.name}</span>
                                                    </div>
                                                ))}
                                                <Button variant="outline" size="sm" className="h-7 w-7 p-0 rounded-full border-dashed">
                                                    <Plus className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Priority</label>
                                            <div className="pt-1">
                                                {isEditing && canEdit ? (
                                                    <select
                                                        className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-2 focus:ring-indigo-500"
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
                                                {isEditing && canEdit ? (
                                                    <input
                                                        type="date"
                                                        className="bg-white border border-slate-200 rounded px-2 py-0.5 text-xs focus:ring-2 focus:ring-indigo-500"
                                                        value={editData.dueDate}
                                                        onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                                                        onClick={(e) => e.target.showPicker?.()}
                                                    />
                                                ) : (
                                                    <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-slate-100 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Attachments</h4>
                                            <Button variant="ghost" size="sm" className="h-6 text-[10px] text-indigo-600 font-bold p-0 hover:bg-transparent">
                                                <Upload className="w-3 h-3 mr-1" /> Add
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            {task.attachments?.map((f, i) => (
                                                <div key={i} className="flex items-center gap-3 p-2 bg-white border border-slate-100 rounded-xl group hover:border-indigo-200 transition-all cursor-pointer">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                                                        <Paperclip className="w-4 h-4 text-indigo-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-bold text-slate-700 truncate">{f.name}</p>
                                                        <p className="text-[9px] text-slate-400 font-medium">{f.size || '2.4MB'}</p>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 hover:bg-rose-50">
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                            <div className="border-2 border-dashed border-slate-100 rounded-xl p-4 text-center group hover:border-indigo-100 transition-colors bg-slate-50/30">
                                                <p className="text-[10px] text-slate-400 font-medium group-hover:text-indigo-400 transition-colors">Drag & drop files here</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-slate-100">
                                        <p className="text-[10px] text-slate-400 text-center italic">
                                            Created on {new Date(task.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default TaskDetailView;
