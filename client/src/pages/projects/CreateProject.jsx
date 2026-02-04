import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

const CreateProject = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await axios.post('/api/projects', data);
            toast.success('Project created successfully');
            navigate('/projects');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Create New Project</h2>

            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <Input
                            label="Project Title"
                            placeholder="e.g. Website Redesign"
                            error={errors.title?.message}
                            {...register('title', { required: 'Title is required' })}
                        />

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-slate-700">Description</label>
                            <textarea
                                className="w-full min-h-[100px] rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Describe the project goals..."
                                {...register('description', { required: 'Description is required' })}
                            />
                            {errors.description && (
                                <span className="text-xs text-rose-500">{errors.description.message}</span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="date"
                                label="Start Date"
                                {...register('startDate')}
                            />
                            <Input
                                type="date"
                                label="End Date"
                                {...register('endDate')}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={() => navigate('/projects')}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Project'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreateProject;
