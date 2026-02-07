import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Clock, Plus, Download, Filter, Info } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { toast } from 'react-hot-toast';
import { getTimesheets, createTimesheet, exportTimesheets } from '@/api/timesheet';
import { getProjects } from '@/api/project';
import { getProjectTasks } from '@/api/task';

const Timesheets = () => {
    const [entries, setEntries] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedLog, setSelectedLog] = useState(null);
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);

    const [formData, setFormData] = useState({
        project: '',
        task: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        description: ''
    });

    useEffect(() => {
        fetchData();
        loadProjects();
    }, []);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const res = await getTimesheets();
            setEntries(res.data);
        } catch (err) {
            toast.error('Failed to fetch timesheets');
        } finally {
            setIsLoading(false);
        }
    };

    const loadProjects = async () => {
        try {
            const res = await getProjects();
            setProjects(res.data.map(p => ({ label: p.title, value: p._id })));
        } catch (err) {
            console.error('Failed to load projects');
        }
    };

    const handleProjectChange = async (projectId) => {
        setFormData({ ...formData, project: projectId, task: '' });
        try {
            const res = await getProjectTasks(projectId);
            setTasks(res.data.map(t => ({ label: t.title, value: t._id })));
        } catch (err) {
            console.error('Failed to load tasks');
            setTasks([]);
        }
    };

    const handleLogSubmit = async (e) => {
        e.preventDefault();
        try {
            await createTimesheet(formData);
            toast.success('Time logged successfully');
            setIsLogModalOpen(false);
            setFormData({
                project: '',
                task: '',
                date: new Date().toISOString().split('T')[0],
                hours: '',
                description: ''
            });
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to log time');
        }
    };

    const handleExport = async () => {
        try {
            await exportTimesheets();
            toast.success('Exporting timesheets...');
        } catch (err) {
            toast.error('Failed to export timesheets');
        }
    };

    const openDetail = (log) => {
        setSelectedLog(log);
        setIsDetailModalOpen(true);
    };

    const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Timesheets</h2>
                    <p className="text-slate-500 mt-1">Record and manage your project work hours.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2" onClick={handleExport}>
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Button className="gap-2" onClick={() => setIsLogModalOpen(true)}>
                        <Plus className="w-4 h-4" />
                        Log Time
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-white border-slate-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-500">Total Hours Logged</span>
                            <Clock className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="mt-2 flex items-baseline gap-1">
                            <h3 className="text-2xl font-bold text-slate-900">{totalHours.toFixed(1)}</h3>
                            <span className="text-xs text-slate-400">total h</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-slate-200 overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-base font-semibold">Logged Entries</CardTitle>
                    <Button variant="ghost" size="sm" className="h-8 gap-2">
                        <Filter className="w-3.5 h-3.5" />
                        Sort & Filter
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6">Date</TableHead>
                                <TableHead>Project</TableHead>
                                <TableHead>Task</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right pr-6">Hours</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                        Loading timesheets...
                                    </TableCell>
                                </TableRow>
                            ) : entries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                        No timesheets found. Start by logging some time!
                                    </TableCell>
                                </TableRow>
                            ) : entries.map((entry) => (
                                <TableRow key={entry._id} className="group">
                                    <TableCell className="pl-6 text-slate-600 font-medium">
                                        {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-slate-900">{entry.project?.title || 'N/A'}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div
                                            className="flex flex-col cursor-pointer hover:bg-slate-50 p-1 rounded-md transition-colors"
                                            onClick={() => openDetail(entry)}
                                        >
                                            <span className="text-sm text-indigo-600 font-medium underline-offset-4 hover:underline flex items-center gap-1">
                                                {entry.task?.title || 'General / Other'}
                                                <Info className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </span>
                                            {entry.description && (
                                                <span className="text-xs text-slate-400 truncate max-w-[200px]">{entry.description}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={entry.status === 'approved' ? 'success' : 'warning'} className="capitalize">
                                            {entry.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right pr-6 font-bold text-slate-900">
                                        {entry.hours.toFixed(1)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Log Time Modal */}
            <Dialog isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Log Work Time</DialogTitle>
                        <DialogDescription>
                            Enter details for the work you've performed.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleLogSubmit}>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Project *</label>
                                <Select
                                    options={projects}
                                    value={formData.project}
                                    onChange={handleProjectChange}
                                    placeholder="Select Project"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Task (Optional)</label>
                                <Select
                                    options={tasks}
                                    value={formData.task}
                                    onChange={(val) => setFormData({ ...formData, task: val })}
                                    placeholder={formData.project ? "Select Task" : "Select project first"}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Date *</label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Hours *</label>
                                    <Input
                                        type="number"
                                        step="0.25"
                                        min="0.25"
                                        max="24"
                                        value={formData.hours}
                                        onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                                        placeholder="0.0"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Description</label>
                                <textarea
                                    className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="What did you work on?"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setIsLogModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={!formData.project || !formData.hours}>
                                Log Time
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Detail Modal */}
            <Dialog isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Time Log Details</DialogTitle>
                    </DialogHeader>
                    {selectedLog && (
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</p>
                                    <p className="text-sm font-medium text-slate-900">
                                        {new Date(selectedLog.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Hours</p>
                                    <p className="text-sm font-bold text-indigo-600">{selectedLog.hours} hours</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Project</p>
                                    <p className="text-sm font-medium text-slate-900">{selectedLog.project?.title || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</p>
                                    <Badge variant={selectedLog.status === 'approved' ? 'success' : 'warning'} className="mt-1">
                                        {selectedLog.status}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Task</p>
                                <p className="text-sm font-medium text-slate-900">{selectedLog.task?.title || 'General / No specific task'}</p>
                            </div>
                            {selectedLog.description && (
                                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</p>
                                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedLog.description}</p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Timesheets;
