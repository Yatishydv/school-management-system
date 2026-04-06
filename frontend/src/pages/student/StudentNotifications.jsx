// frontend/src/pages/student/StudentNotifications.jsx

import React, { useState, useEffect } from "react";
import { 
    Bell, 
    Shield, 
    User, 
    Layers,
    MailOpen,
    Inbox,
    ChevronRight,
    Search,
    Calendar
} from "lucide-react";
import useAuthStore from "../../stores/authStore";
import notificationService from "../../api/notificationService";
import { toast } from "react-toastify";
import Spinner from "../../components/ui/Spinner";

const StudentNotifications = () => {
    const { user, token } = useAuthStore();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationService.getMyNotifications(token);
            setNotifications(data);
        } catch (err) {
            toast.error("Network synchronization failed.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchNotifications();
    }, [token]);

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id, token);
            setNotifications(prev => prev.map(n => 
                n._id === id ? { ...n, isRead: true, readBy: [...(n.readBy || []), user._id] } : n
            ));
        } catch (err) {
            toast.error("Status update failed.");
        }
    };

    const isRead = (notification) => {
        if (notification.targetType === 'User') return notification.isRead;
        return notification.readBy?.includes(user._id);
    };

    const filteredNotifications = notifications.filter(n => {
        const matchesFilter = filter === 'unread' ? !isRead(n) : true;
        const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                             n.message.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) return <div className="p-20 flex items-center justify-center min-h-[60vh] animate-pulse font-body text-blue-400 font-bold uppercase tracking-widest text-xs">Syncing Matrix...</div>;

    return (
        <div className="min-h-screen bg-gray-50/30 pb-24 font-body">
            {/* Clean Header Section */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-8 md:px-14 py-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-blue-950 uppercase italic tracking-tighter">Notification Center</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Official Institutional Broadcast Log</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <input 
                                type="text"
                                placeholder="Filter alerts..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500/20 transition-all"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />
                        </div>
                        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                            {['all', 'unread'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                        filter === f ? "bg-white text-blue-600 shadow-sm border border-gray-100" : "text-gray-400 hover:text-gray-600"
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* List Section */}
            <div className="max-w-4xl mx-auto px-8 md:px-14 py-12">
                <div className="space-y-3">
                    {filteredNotifications.length > 0 ? filteredNotifications.map((alert) => (
                        <div 
                            key={alert._id} 
                            onClick={() => !isRead(alert) && handleMarkAsRead(alert._id)}
                            className={`group cursor-pointer p-5 rounded-xl border transition-all duration-200 ${
                                isRead(alert) 
                                ? 'bg-white border-gray-50 grayscale opacity-60' 
                                : 'bg-white border-blue-100/50 shadow-sm hover:shadow-md hover:border-blue-200 active:scale-[0.99]'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`mt-0.5 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                                    isRead(alert) ? 'bg-gray-50 text-gray-400' : 'bg-blue-50 text-blue-600'
                                }`}>
                                    {alert.targetType === 'All' ? <Shield size={18} /> : alert.targetType === 'Class' ? <Layers size={18} /> : <User size={18} />}
                                </div>
                                
                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="truncate">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                {!isRead(alert) && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>}
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{alert.sender?.role || 'Admin'} Authority</span>
                                            </div>
                                            <h3 className={`text-sm font-black tracking-tight uppercase italic truncate ${isRead(alert) ? 'text-gray-500' : 'text-blue-950'}`}>
                                                {alert.title}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-gray-300 uppercase tracking-tighter shrink-0 pt-1">
                                            <Calendar size={10} />
                                            {new Date(alert.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </div>
                                    </div>

                                    <p className={`text-xs font-medium leading-relaxed font-body italic line-clamp-1 group-hover:line-clamp-none transition-all ${isRead(alert) ? 'text-gray-400' : 'text-gray-600'}`}>
                                        "{alert.message}"
                                    </p>
                                </div>
                                
                                <div className="self-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all shrink-0">
                                    <ChevronRight className="text-blue-400" size={16} />
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="py-32 flex flex-col items-center justify-center text-center space-y-4 bg-white border border-dashed border-gray-100 rounded-3xl">
                            <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-100 shadow-inner">
                                <Inbox size={32} />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-black uppercase italic text-gray-400">Communication Matrix Clear</p>
                                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">No pending dispatches found.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentNotifications;
