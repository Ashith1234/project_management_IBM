import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Calendar, Plus, Trash2, Edit2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import CreateMilestoneModal from './CreateMilestoneModal';

const MilestoneTab = ({ projectId, milestones, onUpdate }) => {
    const { user } = useAuth();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const getStatusVariant = (status) => {
        switch (status) {
            case 'completed': return 'success';
            case 'active': return 'default';
            case 'overdue': return 'destructive';
            case 'upcoming': return 'secondary';
            default: return 'outline';
        }
    };

    const handleDelete = async (milestoneId) => {
        if (!window.confirm('Are you sure you want to delete this milestone?')) {
            return;
        }
        try {
            await axios.delete(`/api/milestones/${milestoneId}`);
            onUpdate();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete milestone');
        }
    };

    const handleStatusUpdate = async (milestoneId, newStatus) => {
        try {
            await axios.put(`/api/milestones/${milestoneId}`, { status: newStatus });
            onUpdate();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update milestone');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Project Milestones</h3>
                {['admin', 'project_manager', 'team_lead'].includes(user?.role) && (
                    <Button
                        size="sm"
                        className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        <Plus className="w-4 h-4" />
                        Add Milestone
                    </Button>
                )}
            </div>

            {milestones.length > 0 ? (
                <div className="grid gap-4">
                    {milestones.map((milestone) => (
                        <Card key={milestone._id} className="p-5 border-slate-200 hover:border-indigo-300 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="text-lg font-semibold text-slate-900">{milestone.title}</h4>
                                        <Badge variant={getStatusVariant(milestone.status)} className="capitalize">
                                            {milestone.status}
                                        </Badge>
                                    </div>
                                    {milestone.description && (
                                        <p className="text-sm text-slate-600 mb-3">{milestone.description}</p>
                                    )}
                                    {milestone.dueDate && (
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>

                                {['admin', 'project_manager', 'team_lead'].includes(user?.role) && (
                                    <div className="flex items-center gap-2 ml-4">
                                        {milestone.status !== 'completed' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-xs"
                                                onClick={() => handleStatusUpdate(milestone._id, 'completed')}
                                            >
                                                Mark Complete
                                            </Button>
                                        )}
                                        {['admin', 'project_manager'].includes(user?.role) && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-rose-600 hover:bg-rose-50 p-2"
                                                onClick={() => handleDelete(milestone._id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 mb-4">No milestones created for this project yet.</p>
                    {['admin', 'project_manager', 'team_lead'].includes(user?.role) && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsCreateOpen(true)}
                        >
                            Create your first milestone
                        </Button>
                    )}
                </div>
            )}

            <CreateMilestoneModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreated={onUpdate}
                projectId={projectId}
            />
        </div>
    );
};

export default MilestoneTab;
