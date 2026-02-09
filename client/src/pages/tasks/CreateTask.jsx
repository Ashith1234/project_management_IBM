import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

const CreateTaskPage = () => {
    const navigate = useNavigate();
    const { projectId } = useParams();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project: projectId || '',
        priority: 'medium',
        dueDate: '',
        assignees: []
    });
    const [projects, setProjects] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // File upload state
    const [attachments, setAttachments] = useState([]);
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsRes, usersRes] = await Promise.all([
                    axios.get('/api/projects'),
                    axios.get('/api/users')
                ]);
                setProjects(projectsRes.data.data);
                setUsers(usersRes.data.data);
            } catch (error) {
                console.error("Error fetching data", error);
            }
        };
        fetchData();
    }, []);

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
            const taskData = {
                ...formData,
                attachments: attachments
            };
            await axios.post('/api/tasks', taskData);
            navigate('/tasks');
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create task");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold text-slate-900">Create New Task</h1>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Task Title *</label>
                    <input
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="What needs to be done?"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Description</label>
                    <textarea
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px]"
                        placeholder="Describe the task in detail..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Project *</label>
                        <select
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.project}
                            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                        >
                            <option value="">Select a project</option>
                            {projects.map(p => (
                                <option key={p._id} value={p._id}>{p.title}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Priority</label>
                        <select
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Due Date</label>
                        <input
                            type="date"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            onClick={(e) => e.target.showPicker?.()}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Assignees</label>
                        <select
                            multiple
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                            value={formData.assignees}
                            onChange={(e) => setFormData({
                                ...formData,
                                assignees: Array.from(e.target.selectedOptions, option => option.value)
                            })}
                        >
                            {users.map(u => (
                                <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                            ))}
                        </select>
                        <p className="text-xs text-slate-500">Hold Ctrl/Cmd to select multiple</p>
                    </div>
                </div>

                {/* File Attachment Section */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Attachments</label>
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
                            <p className="text-sm text-slate-500 font-medium">
                                {uploading ? 'Uploading...' : 'Click to upload files'}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">Maximum file size 10MB</p>
                        </div>

                        {/* File List */}
                        {attachments.length > 0 && (
                            <div className="space-y-2 mt-2">
                                {attachments.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <span className="truncate max-w-[300px] text-sm text-slate-700">{file.name}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeAttachment(index)}
                                            className="text-red-500 hover:text-red-700 font-medium text-sm"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                        <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || uploading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
                        >
                            {loading ? 'Creating...' : 'Create Task'}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateTaskPage;
