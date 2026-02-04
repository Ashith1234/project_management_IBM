import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';

const Projects = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch projects
        // Mock data for now if DB empty, or try to fetch
        const fetchProjects = async () => {
            try {
                const res = await axios.get('/api/projects');
                setProjects(res.data.data);
            } catch (error) {
                console.log("Error fetching projects", error);
                // Fallback / error handling
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">Projects</h2>
                {['admin', 'project_manager', 'team_lead'].includes(user?.role) && (
                    <Link to="/projects/create">
                        <Button>New Project</Button>
                    </Link>
                )}
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {projects.length > 0 ? projects.map((project) => (
                        <Card key={project._id} className="hover:shadow-md transition-shadow">
                            <CardHeader>
                                <Link to={`/projects/${project._id}`} className="hover:text-indigo-600 transition-colors">
                                    <CardTitle className="text-lg cursor-pointer">{project.title}</CardTitle>
                                </Link>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                                    {project.description}
                                </p>
                                <div className="flex items-center justify-between text-xs text-slate-400">
                                    <span>{new Date(project.startDate).toLocaleDateString()}</span>
                                    <span className={`px-2 py-1 rounded-full ${project.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100'}`}>
                                        {project.status}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )) : (
                        <div className="col-span-full text-center py-10 text-slate-500">
                            No projects found. Create one to get started.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Projects;
