import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogFooter
} from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

const CreateTaskModal = ({ isOpen, onClose, onCreated, initialProjectId = '' }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project: initialProjectId || '',
        priority: 'medium',
        dueDate: '',
        assignees: []
    });

    useEffect(() => {
        if (isOpen && initialProjectId) {
            setFormData(prev => ({ ...prev, project: initialProjectId }));
        }
    }, [isOpen, initialProjectId]);
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            Promise.all([
                axios.get('/api/projects'),
                axios.get('/api/users')
            ]).then(([projectRes, userRes]) => {
                setProjects(projectRes?.data?.data || []);
                setUsers(userRes?.data?.data || []);
            }).catch(err => {
                console.error("Error fetching modal data", err);
                setProjects([]);
                setUsers([]);
            });
            // Reset attachments when modal opens
            setAttachments([]);
        }
    }, [isOpen]);

    const handleAssigneeToggle = (userId) => {
        setFormData(prev => ({
            ...prev,
            assignees: prev.assignees.includes(userId)
                ? prev.assignees.filter(id => id !== userId)
                : [...prev.assignees, userId]
        }));
    };

    const handleFileClick = () => {
        if (!formData.project) {
            alert("Please select a project first before uploading files.");
            return;
        }
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        const newAttachments = [];

        try {
            // Upload each file individually
            for (const file of files) {
                const uploadData = new FormData();
                uploadData.append('file', file);
                uploadData.append('project', formData.project);

                const res = await axios.post('/api/files', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (res.data && res.data.data) {
                    newAttachments.push({
                        name: res.data.data.name,
                        url: res.data.data.url,
                        fileType: res.data.data.type
                    });
                }
            }

            setAttachments(prev => [...prev, ...newAttachments]);
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload files. Please try again.");
        } finally {
            setUploading(false);
            // Reset input so same file can be selected again if needed
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Prepare task data with attachments
            const taskData = {
                ...formData,
                attachments: attachments
            };

            await axios.post('/api/tasks', taskData);
            onCreated();
            onClose();
            setFormData({ title: '', description: '', project: initialProjectId || '', priority: 'medium', dueDate: '', assignees: [] });
            setAttachments([]);
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create task");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose}>
            <DialogContent className="max-w-md bg-white p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-slate-100">
                    <DialogTitle className="text-xl font-bold font-outfit">Create New Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Task Title</label>
                        <input
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="What needs to be done?"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project</label>
                            <select
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                value={formData.project}
                                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                            >
                                <option value="">Select Project</option>
                                {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                onClick={(e) => e.target.showPicker?.()}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Priority</label>
                        <div className="flex gap-2">
                            {['low', 'medium', 'high', 'critical'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority: p })}
                                    className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize transition-all border ${formData.priority === p
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300'
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assign User(s)</label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-1">
                            {users.map(u => (
                                <div
                                    key={u._id}
                                    onClick={() => handleAssigneeToggle(u._id)}
                                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${formData.assignees.includes(u._id)
                                        ? 'bg-indigo-50 border-indigo-200'
                                        : 'bg-white border-slate-100 hover:border-slate-200'
                                        }`}
                                >
                                    <div className={`w-3 h-3 rounded-full border ${formData.assignees.includes(u._id) ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'}`} />
                                    <span className="text-xs font-medium text-slate-700">{u.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                            placeholder="Provide some details..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attach Files</label>
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <div
                            onClick={handleFileClick}
                            className={`border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-300 transition-colors cursor-pointer bg-slate-50/50 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <p className="text-xs text-slate-500 font-medium">
                                {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">Maximum file size 10MB</p>
                        </div>

                        {/* File List */}
                        {attachments.length > 0 && (
                            <div className="space-y-2 mt-2">
                                {attachments.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                                        <span className="truncate max-w-[200px] text-slate-700">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(index)}
                                            className="text-red-500 hover:text-red-700 font-medium"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="font-bold text-slate-500 hover:bg-transparent">Cancel</Button>
                        <Button
                            type="submit"
                            disabled={loading || uploading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 rounded-xl"
                        >
                            {loading ? 'Creating...' : 'Create Task'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateTaskModal;
