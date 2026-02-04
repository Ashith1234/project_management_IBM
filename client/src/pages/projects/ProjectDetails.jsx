import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import {
    Calendar,
    ChevronLeft,
    MoreHorizontal,
    Clock,
    DollarSign,
    User,
    CheckCircle2,
    FileText,
    MessageSquare
} from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import TaskDetailView from '@/components/tasks/TaskDetailView';
import CreateTaskModal from '@/components/tasks/CreateTaskModal';
import MilestoneTab from '@/components/projects/MilestoneTab';
import FileTab from '@/components/projects/FileTab';
import DiscussionTab from '@/components/projects/DiscussionTab';
import EditProjectModal from '@/components/projects/EditProjectModal';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [projectRes, tasksRes, milestonesRes] = await Promise.all([
                axios.get(`/api/projects/${id}`),
                axios.get(`/api/tasks?projectId=${id}`),
                axios.get(`/api/projects/${id}/milestones`)
            ]);
            setProject(projectRes.data.data);
            setTasks(tasksRes.data.data);
            setMilestones(milestonesRes.data.data);
        } catch (error) {
            console.error("Error fetching project details", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleTaskClick = (taskId) => {
        setSelectedTaskId(taskId);
        setIsDetailOpen(true);
    };

    const handleDeleteProject = async () => {
        if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }
        try {
            await axios.delete(`/api/projects/${id}`);
            navigate('/projects');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete project');
        }
    };

    if (loading) return (
        <div className="space-y-6">
            <Skeleton className="h-12 w-1/3" />
            <div className="grid gap-4 md:grid-cols-4">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
            </div>
            <Skeleton className="h-64" />
        </div>
    );

    if (!project) return <div>Project not found</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/projects">
                        <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent">
                            <ChevronLeft className="w-5 h-5 text-slate-400" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900">{project.title}</h2>
                            <Badge variant={project.status === 'active' ? 'success' : 'outline'}>
                                {project.status}
                            </Badge>
                        </div>
                        <p className="text-slate-500 mt-1">{project.description}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {['admin', 'project_manager'].includes(user?.role) && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-rose-600 border-rose-300 hover:bg-rose-50"
                            onClick={handleDeleteProject}
                        >
                            Delete Project
                        </Button>
                    )}
                    {['admin', 'project_manager', 'team_lead'].includes(user?.role) && (
                        <Button size="sm" onClick={() => setIsEditOpen(true)}>Edit Project</Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card className="border-slate-100 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 text-slate-500 mb-2">
                            <User className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Manager</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-indigo-50 text-indigo-700 text-xs font-bold">
                                    {project.manager?.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-slate-900">{project.manager?.name}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-100 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 text-slate-500 mb-2">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Timeline</span>
                        </div>
                        <p className="font-semibold text-slate-900">
                            {new Date(project.startDate).toLocaleDateString()} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'TBD'}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-slate-100 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 text-slate-500 mb-2">
                            <DollarSign className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Budget</span>
                        </div>
                        <p className="font-semibold text-slate-900">
                            {project.budget ? `$${project.budget.toLocaleString()}` : "Not Set"}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-slate-100 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3 text-slate-500 mb-2">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-medium uppercase tracking-wider">Progress</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full">
                                <div className="h-full bg-indigo-500 rounded-full w-[45%]"></div>
                            </div>
                            <span className="text-sm font-bold text-slate-700">45%</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="tasks">
                <TabsList className="bg-transparent border-b border-slate-200 rounded-none w-full justify-start gap-8 px-0">
                    <TabsTrigger value="tasks" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent shadow-none px-0 pb-4">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Tasks
                    </TabsTrigger>
                    <TabsTrigger value="files" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent shadow-none px-0 pb-4">
                        <FileText className="w-4 h-4 mr-2" />
                        Files
                    </TabsTrigger>
                    <TabsTrigger value="milestones" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent shadow-none px-0 pb-4">
                        <Calendar className="w-4 h-4 mr-2" />
                        Milestones
                    </TabsTrigger>
                    <TabsTrigger value="discussions" className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent shadow-none px-0 pb-4">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Discussions
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="tasks" className="pt-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-900">Project Tasks</h3>
                        {['admin', 'project_manager', 'team_lead'].includes(user?.role) && (
                            <Button size="sm" onClick={() => setIsCreateOpen(true)}>Add Task</Button>
                        )}
                    </div>

                    <div className="grid gap-4">
                        {tasks.length > 0 ? tasks.map((task) => (
                            <Card
                                key={task._id}
                                className="p-4 hover:border-indigo-300 transition-colors cursor-pointer border-slate-200"
                                onClick={() => handleTaskClick(task._id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-1 rounded-full ${task.priority === 'high' ? 'bg-rose-500' :
                                            task.priority === 'medium' ? 'bg-amber-500' : 'bg-slate-300'
                                            }`}></div>
                                        <div>
                                            <h4 className="font-semibold text-slate-900">{task.title}</h4>
                                            <p className="text-sm text-slate-500 truncate max-w-md">{task.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] uppercase font-bold text-slate-400">Due</span>
                                            <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
                                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Date"}
                                            </span>
                                        </div>
                                        <Badge variant={task.status === 'done' ? 'success' : 'outline'} className="capitalize">
                                            {task.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>
                            </Card>
                        )) : (
                            <div className="py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                <Clock className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-500">No tasks created for this project yet.</p>
                                {['admin', 'project_manager', 'team_lead'].includes(user?.role) && (
                                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsCreateOpen(true)}>Build your first task</Button>
                                )}
                            </div>
                        )}
                    </div>
                </TabsContent>
                <TabsContent value="milestones" className="pt-6">
                    <MilestoneTab projectId={id} milestones={milestones} onUpdate={fetchData} />
                </TabsContent>
                <TabsContent value="files" className="pt-6">
                    <FileTab projectId={id} />
                </TabsContent>
                <TabsContent value="discussions" className="pt-6">
                    <DiscussionTab projectId={id} />
                </TabsContent>
            </Tabs>

            <TaskDetailView
                taskId={selectedTaskId}
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                onUpdate={fetchData}
            />

            <CreateTaskModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                onCreated={fetchData}
                initialProjectId={id}
            />

            <EditProjectModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onUpdated={fetchData}
                project={project}
            />
        </div>
    );
};

export default ProjectDetails;
