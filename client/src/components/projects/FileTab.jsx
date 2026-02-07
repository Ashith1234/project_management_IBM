import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FileText, Plus, Trash2, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

const FileTab = ({ projectId }) => {
    const { user } = useAuth();
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const fetchFiles = async () => {
        try {
            const res = await axios.get(`/api/files?projectId=${projectId}`);
            setFiles(res.data.data);
        } catch (error) {
            console.error("Error fetching files", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [projectId]);

    const handleDelete = async (fileId) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        try {
            await axios.delete(`/api/files/${fileId}`);
            toast.success('File deleted');
            fetchFiles();
        } catch (error) {
            toast.error('Failed to delete file');
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('project', projectId);

        try {
            await axios.post('/api/files', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success('File uploaded successfully');
            fetchFiles();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload file');
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Reset input
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };

    const formatSize = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Project Files</h3>
                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                <Button
                    size="sm"
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleUploadClick}
                    disabled={isUploading}
                    isLoading={isUploading}
                >
                    <Plus className="w-4 h-4" />
                    Upload File
                </Button>
            </div>

            {loading ? (
                <div>Loading files...</div>
            ) : files.length > 0 ? (
                <div className="grid gap-4">
                    {files.map((file) => (
                        <Card key={file._id} className="p-4 border-slate-200 flex items-center justify-between hover:border-indigo-300 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-900">{file.name}</h4>
                                    <p className="text-xs text-slate-500">
                                        {formatSize(file.size)} • Uploaded by {file.uploadedBy?.name} • {new Date(file.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={file.url}
                                    download={file.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                </a>
                                {(['admin', 'project_manager'].includes(user?.role) || file.uploadedBy?._id === user?.id) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-slate-400 hover:text-rose-600"
                                        onClick={() => handleDelete(file._id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500">No files uploaded yet.</p>
                </div>
            )}
        </div>
    );
};

export default FileTab;
