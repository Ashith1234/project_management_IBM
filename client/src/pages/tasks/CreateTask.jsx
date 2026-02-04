import { useState, useEffect } from 'react';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/tasks', formData);
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

                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                    <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
                    >
                        {loading ? 'Creating...' : 'Create Task'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CreateTaskPage;
