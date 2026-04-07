import React, { useState, useEffect } from "react";
import { 
    Send, 
    Users, 
    User, 
    School, 
    Clock, 
    Bell, 
    Search, 
    Filter,
    ChevronRight,
    Trash2
} from "lucide-react";
import useAuthStore from "../../stores/authStore";
import adminService from "../../api/adminService";
import notificationService from "../../api/notificationService";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";

const AdminNotifications = () => {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [history, setHistory] = useState([]);
    
    // Form State
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [targetType, setTargetType] = useState("All");
    const [targetId, setTargetId] = useState("");
    
    // Selection Data
    const [classes, setClasses] = useState([]);
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const data = await notificationService.getAdminSentNotifications(token);
            setHistory(data);
        } catch (err) {
            console.error(err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const fetchSelectionData = async () => {
        try {
            const [classesData, teachersData, studentsData] = await Promise.all([
                adminService.getClasses(token),
                adminService.getUsers("teacher", token),
                adminService.getUsers("student", token)
            ]);
            setClasses(classesData);
            setUsers([...teachersData, ...studentsData]);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Permanently remove this elite alert from history?")) return;
        try {
            await notificationService.deleteNotification(id, token);
            setHistory(prev => prev.filter(n => n._id !== id));
            toast.success("Strategic data purged.");
        } catch (err) {
            toast.error("Purge aborted.");
        }
    };

    useEffect(() => {
        fetchHistory();
        fetchSelectionData();
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!title || !message) return toast.error("Deployment requires content.");
        if (['Class', 'User'].includes(targetType) && !targetId) return toast.error("Recipients must be identified.");

        setLoading(true);
        try {
            await notificationService.sendNotification({
                title,
                message,
                targetType,
                targetId: targetId || null
            }, token);
            toast.success("Broadcast deployed successfully.");
            setTitle("");
            setMessage("");
            setTargetId("");
            fetchHistory();
        } catch (err) {
            toast.error("Deployment failed.");
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.uniqueId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50/50 space-y-12 pb-24 relative overflow-hidden">
            {/* Background Watermark */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 text-[15vw] font-black text-gray-100/50 pointer-events-none select-none tracking-tighter uppercase whitespace-nowrap">
                BROADCAST
            </div>

            {/* Hero Header */}
            <header className="px-8 md:px-14 pt-16 space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent-500"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Communication Node</span>
                </div>
                <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter leading-none text-primary-950">
                    Alert <span className="text-gray-200">System.</span>
                </h1>
            </header>

            <div className="px-4 sm:px-8 md:px-14 grid lg:grid-cols-2 gap-12 relative z-10 w-full overflow-x-hidden box-border">
                {/* Deployment Control */}
                <section className="space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-10 md:p-14 border border-gray-100 shadow-sm space-y-10 group transition-all duration-500 hover:shadow-xl">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black tracking-tighter text-primary-950 uppercase italic">Deploy Notification</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">
                                Strategic broadcast protocol for institutional personnel.
                            </p>
                        </div>

                        <form onSubmit={handleSend} className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary-950 ml-2">Broadcast Content</label>
                                <input 
                                    type="text" 
                                    placeholder="Alert Title"
                                    className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent-500 text-primary-950 font-bold placeholder:text-gray-300 transition-all font-body"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <textarea 
                                    placeholder="Strategic Message Content"
                                    rows="4"
                                    className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent-500 text-primary-950 font-bold placeholder:text-gray-300 transition-all font-body resize-none"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary-950 ml-2">Target Parameters</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {[
                                        { id: 'All', icon: School, label: 'Everyone' },
                                        { id: 'Teachers', icon: Users, label: 'Faculty' },
                                        { id: 'Students', icon: User, label: 'Scholars' },
                                        { id: 'Class', icon: Filter, label: 'Classroom' },
                                        { id: 'User', icon: Search, label: 'Individual' },
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => { setTargetType(opt.id); setTargetId(""); }}
                                            className={`p-6 rounded-[2rem] border transition-all flex flex-col items-center gap-3 group/btn ${
                                                targetType === opt.id 
                                                    ? "bg-primary-950 border-primary-950 text-white shadow-lg" 
                                                    : "bg-white border-gray-100 text-gray-400 hover:border-accent-500 hover:text-accent-500"
                                            }`}
                                        >
                                            <opt.icon size={20} />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {targetType === 'Class' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary-950 ml-2">Select Hub</label>
                                    <select 
                                        className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent-500 text-primary-950 font-bold font-body transition-all"
                                        value={targetId}
                                        onChange={(e) => setTargetId(e.target.value)}
                                    >
                                        <option value="">Choose Class Registry...</option>
                                        {classes.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}{c.stream !== 'General' ? ` (${c.stream})` : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {targetType === 'User' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary-950 ml-2">Identify User</label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="Search by name or unique ID..."
                                            className="w-full px-8 py-5 pl-14 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-accent-500 text-primary-950 font-bold font-body transition-all"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                    </div>
                                    
                                    {searchQuery && (
                                        <div className="max-h-60 overflow-y-auto bg-white rounded-2xl border border-gray-100 shadow-xl p-2 space-y-1 scrollbar-hide">
                                            {filteredUsers.length > 0 ? filteredUsers.map(u => (
                                                <button
                                                    key={u._id}
                                                    type="button"
                                                    onClick={() => { setTargetId(u._id); setSearchQuery(u.name); }}
                                                    className={`w-full p-4 rounded-xl text-left flex items-center justify-between group/row ${
                                                        targetId === u._id ? "bg-accent-50 text-accent-600" : "hover:bg-gray-50"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black">
                                                            {u.role[0].toUpperCase()}
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <div className="text-sm font-black text-primary-950">{u.name}</div>
                                                            <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase italic">{u.uniqueId}</div>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={14} className="text-gray-300 group-hover/row:translate-x-1 transition-transform" />
                                                </button>
                                            )) : (
                                                <div className="p-8 text-center text-gray-400 text-xs font-bold font-body">No matches found.</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full py-8 rounded-[2rem] bg-accent-500 text-white font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-accent-500/20 hover:bg-accent-600 hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-4 group"
                            >
                                {loading ? "Deploying..." : (
                                    <>
                                        Execute Deployment
                                        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </section>

                {/* History Matrix */}
                <section className="space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-10 md:p-14 border border-gray-100 shadow-sm space-y-10 min-h-[600px] flex flex-col">
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black tracking-tighter text-primary-950 uppercase italic">Deployment History</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chronological Log of Alerts</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-2xl text-accent-500">
                                <Clock size={20} />
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            {historyLoading ? (
                                <div className="h-full flex items-center justify-center text-gray-400 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Log...</div>
                            ) : history.length > 0 ? history.map((alert) => (
                                <div key={alert._id} className="p-8 rounded-[2rem] bg-gray-50/50 border border-transparent hover:border-gray-100 hover:bg-white transition-all duration-300 group shadow-sm hover:shadow-md">
                                    <div className="flex justify-between items-start gap-4 mb-4">
                                        <div className="space-y-1 overflow-hidden">
                                            <h4 className="text-xl font-black text-primary-950 tracking-tight leading-tight truncate">{alert.title}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-accent-500 uppercase tracking-widest italic">{alert.targetType}: {alert.targetId?.name ? `${alert.targetId.name}${alert.targetId.stream && alert.targetId.stream !== 'General' ? ` (${alert.targetId.stream})` : ''}` : "All Personnel"}</span>
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-300 whitespace-nowrap pt-1">
                                            {new Date(alert.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-gray-500 leading-relaxed font-body line-clamp-2 italic mb-6">
                                        "{alert.message}"
                                    </p>
                                    <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                                        <div className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-gray-100 text-[9px] font-black text-gray-400 uppercase tracking-widest shadow-sm">
                                            <Bell size={10} className="text-accent-500" />
                                            Active Priority
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(alert._id)}
                                            className="text-gray-300 hover:text-red-500 transition-colors p-2"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-200">
                                        <Bell size={40} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-black text-primary-950 uppercase tracking-widest">Registry Empty</div>
                                        <div className="text-[10px] font-bold text-gray-400 font-body uppercase tracking-[0.2em]">No alerts deployed to date.</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdminNotifications;
