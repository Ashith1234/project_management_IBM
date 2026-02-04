import { useState } from 'react';
import axios from 'axios';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

const CreateMilestoneModal = ({ isOpen, onClose, onCreated, projectId }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        status: 'upcoming'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`/api/projects/${projectId}/milestones`, formData);
            onCreated();
            onClose();
            setFormData({ title: '', description: '', dueDate: '', status: 'upcoming' });
        } catch (error) {
            alert(error.response?.data?.message || "Failed to create milestone");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose}>
            <DialogContent className="max-w-md bg-white p-0 overflow-hidden">
                <DialogHeader className="p-6 border-b border-slate-100">
                    <DialogTitle className="text-xl font-bold font-outfit">Create New Milestone</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Milestone Title</label>
                        <input
                            required
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="What's the milestone?"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Due Date</label>
                            <input
                                type="date"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</label>
                            <select
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="overdue">Overdue</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                            placeholder="Describe the milestone..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} className="font-bold text-slate-500 hover:bg-transparent">Cancel</Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 rounded-xl"
                        >
                            {loading ? 'Creating...' : 'Create Milestone'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateMilestoneModal;
