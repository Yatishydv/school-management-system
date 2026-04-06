import React, { useState, useEffect } from "react";
import { 
    Bell, 
    CheckCircle2, 
    Clock, 
    Shield, 
    User, 
    Layers,
    MailOpen,
    Filter
} from "lucide-react";
import useAuthStore from "../../stores/authStore";
import notificationService from "../../api/notificationService";
import { toast } from "react-toastify";

const NotificationsPage = () => {
    const { user, token } = useAuthStore();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all"); // all, unread

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationService.getMyNotifications(token);
            setNotifications(data);
        } catch (err) {
            toast.error("Failed to sync your alert feed.");
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
            toast.error("Update failed.");
        }
    };

    const isRead = (notification) => {
        if (notification.targetType === 'User') return notification.isRead;
        return notification.readBy?.includes(user._id);
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !isRead(n);
        return true;
    });

    const roleColor = user?.role === 'teacher' ? 'emerald' : 'sky';

    return (
        <div className={`min-h-screen bg-gray-50/20 pb-24 font-body relative overflow-hidden`}>
            {/* Background Watermark */}
            <div className={`absolute top-20 left-1/2 -translate-x-1/2 text-[15vw] font-black text-${roleColor}-100/30 pointer-events-none select-none tracking-tighter uppercase whitespace-nowrap`}>
                COMMUNICATIONS
            </div>

            {/* Hero Header */}
            <header className="px-8 md:px-14 pt-16 space-y-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full bg-${roleColor}-600`}></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Institutional Alerts</span>
                </div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <h1 className={`text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter leading-none text-${roleColor}-950`}>
                        Your <span className={`text-${roleColor}-100 italic`}>Feed.</span>
                    </h1>
                    
                    <div className="flex items-center p-1 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-xl">
                        <button 
                            onClick={() => setFilter("all")}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                filter === "all" ? `bg-${roleColor}-600 text-white shadow-lg` : "text-gray-400 hover:text-primary-950"
                            }`}
                        >
                            All Stream
                        </button>
                        <button 
                            onClick={() => setFilter("unread")}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                filter === "unread" ? `bg-${roleColor}-600 text-white shadow-lg` : "text-gray-400 hover:text-primary-950"
                            }`}
                        >
                            Unread Only
                        </button>
                    </div>
                </div>
            </header>

            <div className="px-4 sm:px-8 md:px-14 mt-16 max-w-4xl relative z-10">
                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center space-y-6">
                        <div className={`w-12 h-12 border-4 border-${roleColor}-100 border-t-${roleColor}-600 rounded-full animate-spin`}></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse">Syncing Encrypted Feed...</p>
                    </div>
                ) : filteredNotifications.length > 0 ? (
                    <div className="space-y-8">
                        {filteredNotifications.map((alert) => (
                            <div 
                                key={alert._id} 
                                className={`group relative bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${!isRead(alert) ? `border-l-8 border-l-${roleColor}-500` : ''}`}
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                                    <div className="space-y-6 flex-1">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-4 rounded-2xl ${isRead(alert) ? 'bg-gray-50 text-gray-400' : `bg-${roleColor}-50 text-${roleColor}-600`}`}>
                                                {alert.targetType === 'All' ? <School size={20} /> : alert.targetType === 'Class' ? <Layers size={20} /> : <User size={20} />}
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className={`text-2xl font-black tracking-tighter text-${roleColor}-950 uppercase italic group-hover:underline decoration-${roleColor}-500/20 underline-offset-8`}>{alert.title}</h3>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                        <Clock size={12} className={`text-${roleColor}-500`} />
                                                        {new Date(alert.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                        <Shield size={12} className={`text-${roleColor}-500`} />
                                                        {alert.sender?.role || 'Admin'} Authority
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="pl-2">
                                            <p className="text-base font-medium text-gray-500 leading-relaxed font-body whitespace-pre-wrap italic">
                                                "{alert.message}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-6 pt-2 shrink-0">
                                        {!isRead(alert) ? (
                                            <button 
                                                onClick={() => handleMarkAsRead(alert._id)}
                                                className={`px-8 py-3 bg-${roleColor}-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-${roleColor}-600/20 hover:bg-${roleColor}-700 hover:shadow-xl transition-all flex items-center gap-3 group/btn`}
                                            >
                                                Mark as Read
                                                <CheckCircle2 size={14} className="group-hover/btn:scale-110 transition-transform" />
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 rounded-xl text-[10px] font-black text-gray-300 uppercase tracking-widest border border-gray-100">
                                                <MailOpen size={14} />
                                                Archived
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-40 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-1000">
                        <div className={`w-32 h-32 rounded-[3rem] bg-white border border-gray-100 flex items-center justify-center text-gray-100 shadow-sm`}>
                            <Bell size={64} />
                        </div>
                        <div className="space-y-3">
                            <h3 className={`text-2xl font-black tracking-tighter text-${roleColor}-950 uppercase italic`}>Registry Clear</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] max-w-xs leading-loose">
                                No active alerts are targeting your institutional profile at this time.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Help helper component for icons
const School = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;

export default NotificationsPage;
