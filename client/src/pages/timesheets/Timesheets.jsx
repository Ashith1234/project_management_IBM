import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Clock, Plus, Download, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const Timesheets = () => {
    // Mock data for UI demo
    const [entries] = useState([
        { id: 1, project: 'Website Redesign', task: 'Design Home Page', date: new Date().toISOString(), hours: 4, status: 'approved', description: 'Mockup in Figma' },
        { id: 2, project: 'Mobile App', task: 'Bug Fixes', date: new Date().toISOString(), hours: 2, status: 'pending', description: 'Fixed crash on login' },
        { id: 3, project: 'Internal CRM', task: 'Database Optimization', date: '2026-01-30', hours: 6, status: 'approved', description: 'Indexing user tables' }
    ]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Timesheets</h2>
                    <p className="text-slate-500 mt-1">Record and manage your project work hours.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Export
                    </Button>
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Log Time
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <Card className="bg-white border-slate-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-500">Total Hours</span>
                            <Clock className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="mt-2 flex items-baseline gap-1">
                            <h3 className="text-2xl font-bold text-slate-900">12.5</h3>
                            <span className="text-xs text-slate-400">h this week</span>
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
                            {entries.map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell className="pl-6 text-slate-600">
                                        {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-slate-900">{entry.project}</span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="text-sm text-slate-700">{entry.task}</span>
                                            <span className="text-xs text-slate-400 italic">{entry.description}</span>
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
        </div>
    );
};

export default Timesheets;
