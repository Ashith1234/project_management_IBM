import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const DiscussionTab = ({ projectId }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`/api/discussions?projectId=${projectId}`);
            setMessages(res.data.data);
        } catch (error) {
            console.error("Error fetching discussions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        // Setup polling or socket here in a real app
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [projectId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            const res = await axios.post('/api/discussions', {
                project: projectId,
                content: newMessage
            });
            setMessages([...messages, res.data.data]);
            setNewMessage('');
        } catch (error) {
            alert('Failed to send message');
        }
    };

    return (
        <div className="flex flex-col h-[500px] border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-900">Project Chat</h3>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {loading ? (
                    <div className="text-center py-10 text-slate-400 italic">Connecting to chat...</div>
                ) : messages.length > 0 ? (
                    messages.map((msg) => (
                        <div key={msg._id} className={`flex gap-3 ${msg.sender?._id === user?.id ? 'flex-row-reverse' : ''}`}>
                            <Avatar className="w-8 h-8 shrink-0">
                                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-[10px] font-bold">
                                    {msg.sender?.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className={`flex flex-col ${msg.sender?._id === user?.id ? 'items-end' : ''}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-slate-600">{msg.sender?.name}</span>
                                    <span className="text-[10px] text-slate-400">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className={`p-3 rounded-2xl text-sm ${msg.sender?._id === user?.id
                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                        : 'bg-slate-100 text-slate-800 rounded-tl-none'
                                    } shadow-sm max-w-sm`}>
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 text-slate-400 italic">No messages yet. Start the conversation!</div>
                )}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 bg-slate-50 border-none rounded-full text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                    />
                    <Button
                        type="submit"
                        size="sm"
                        className="rounded-full w-10 h-10 p-0 shrink-0 bg-indigo-600 hover:bg-indigo-700"
                        disabled={!newMessage.trim()}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default DiscussionTab;
