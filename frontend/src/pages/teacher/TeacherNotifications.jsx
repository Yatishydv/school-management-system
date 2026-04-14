import React, { useState, useEffect } from "react";
import { 
    Send, 
    Users, 
    User, 
    Layers, 
    Clock, 
    Bell, 
    Search, 
    ChevronRight,
    Trash2,
    CheckCircle2,
    Inbox,
    History,
    MessageSquare,
    Shield
} from "lucide-react";
import useAuthStore from "../../stores/authStore";
import teacherService from "../../api/teacherService";
import notificationService from "../../api/notificationService";
import { toast } from "react-toastify";

const TeacherNotifications = () => {
    const { token } = useAuthStore();
    const [activeTab, setActiveTab] = useState("inbox"); // 'inbox' or 'dispatch'
    const [loading, setLoading] = useState(false);
    
    // Inbox State
    const [inboxNotifications, setInboxNotifications] = useState([]);
    const [inboxLoading, setInboxLoading] = useState(false);

    // Dispatch State
    const [historyLoading, setHistoryLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [targetType, setTargetType] = useState("Class");
    const [targetId, setTargetId] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    
    // Selection Data
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchInbox = async () => {
        setInboxLoading(true);
        try {
            const data = await notificationService.getMyNotifications(token);
            setInboxNotifications(data);
        } catch (err) {
            console.error(err);
        } finally {
            setInboxLoading(false);
        }
    };

    const fetchHistory = async () => {
        setHistoryLoading(true);
        try {
            const data = await notificationService.getTeacherSentNotifications(token);
            setHistory(data);
        } catch (err) {
            console.error(err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const fetchTeacherData = async () => {
        try {
            const classesData = await teacherService.getAssignedClasses(token);
            setClasses(classesData);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchClassStudents = async (classId) => {
        try {
            const studentsData = await teacherService.getClassStudents(classId, token);
            setStudents(studentsData);
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationService.markAsRead(id, token);
            setInboxNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            toast.success("Alert marked as read.");
        } catch (err) {
            toast.error("Process failed.");
        }
    };

    const handleDeleteSent = async (id) => {
        if (!window.confirm("Permanently remove this alert from the archive?")) return;
        try {
            await notificationService.deleteTeacherNotification(id, token);
            setHistory(prev => prev.filter(n => n._id !== id));
            toast.success("Alert purged.");
        } catch (err) {
            toast.error("Purge failed.");
        }
    };

    useEffect(() => {
        fetchInbox();
        fetchHistory();
        fetchTeacherData();
    }, []);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!title || !message) return toast.error("Notification requires content.");
        if (targetType === 'Class' && !targetId) return toast.error("Please select a target class.");
        if (targetType === 'User' && !selectedStudent) return toast.error("Please identify the target student.");

        setLoading(true);
        try {
            if (targetType === 'Class') {
                await notificationService.sendClassNotification({ title, message, classId: targetId }, token);
            } else {
                await notificationService.sendStudentNotification({ title, message, studentId: selectedStudent._id }, token);
            }
            toast.success("Broadcast dispatched successfully.");
            setTitle("");
            setMessage("");
            setTargetId("");
            setSelectedStudent(null);
            setSearchQuery("");
            fetchHistory();
        } catch (err) {
            toast.error("Dispatch failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleClassChange = (e) => {
        const id = e.target.value;
        setTargetId(id);
        if (id) fetchClassStudents(id);
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.uniqueId.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50/50 space-y-12 pb-24 relative overflow-hidden font-body">
            {/* Hero Header */}
            <header className="px-8 md:px-14 pt-16 space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Communication Hub</span>
                </div>
                <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter leading-none text-emerald-950">
                    Faculty <span className="text-emerald-100 italic">Matrix.</span>
                </h1>
                
                {/* Navigation Tabs */}
                <div className="flex gap-8 border-b border-gray-100 pt-12">
                    {[
                        { id: 'inbox', label: 'Incoming Inbox', icon: Inbox },
                        { id: 'dispatch', label: 'Dispatch Alerts', icon: Send }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 pb-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${
                                activeTab === tab.id ? 'text-emerald-600' : 'text-gray-300 hover:text-gray-500'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-600 rounded-full"></div>
                            )}
                        </button>
                    ))}
                </div>
            </header>

            <div className="px-4 sm:px-8 md:px-14 relative z-10 w-full overflow-x-hidden box-border">
                {activeTab === 'inbox' ? (
                    /* INBOX VIEW - RECEIVED NOTIFICATIONS */
                    <div className="grid lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
                                <div className="p-10 border-b border-gray-50 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-3xl font-black tracking-tighter text-emerald-950 uppercase italic leading-none">Intelligence Feed</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">Incoming data from Administration</p>
                                    </div>
                                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                                        <Bell size={24} />
                                    </div>
                                </div>

                                <div className="flex-1 p-6 md:p-10 space-y-6">
                                    {inboxLoading ? (
                                        <div className="h-full flex items-center justify-center text-emerald-600 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Matrix...</div>
                                    ) : inboxNotifications.length > 0 ? inboxNotifications.map((alert) => (
                                        <div key={alert._id} className={`p-8 rounded-[2rem] border transition-all duration-300 group ${
                                            alert.isRead ? 'bg-gray-50/50 border-gray-50 opacity-70' : 'bg-white border-emerald-100 shadow-md ring-1 ring-emerald-50'
                                        }`}>
                                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                                <div className="space-y-2 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        {!alert.isRead && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>}
                                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">{alert.sender?.role || 'Admin'} Dispatch</span>
                                                    </div>
                                                    <h4 className="text-2xl font-black text-emerald-950 tracking-tight leading-none group-hover:text-emerald-700 transition-colors uppercase italic">{alert.title}</h4>
                                                </div>
                                                <div className="text-[10px] font-bold text-gray-400 whitespace-nowrap pt-1 bg-gray-50 px-4 py-2 rounded-full">
                                                    {new Date(alert.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                            
                                            <p className="text-sm font-medium text-gray-600 leading-relaxed font-body mb-8 italic">
                                                "{alert.message}"
                                            </p>

                                            <div className="flex items-center justify-between border-t border-gray-50 pt-6">
                                                <div className="flex items-center gap-4 text-gray-400">
                                                    <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest">
                                                        <Clock size={12} /> Live Record
                                                    </div>
                                                </div>
                                                {!alert.isRead && (
                                                    <button 
                                                        onClick={() => handleMarkAsRead(alert._id)}
                                                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-800 transition-colors bg-emerald-50 px-6 py-2.5 rounded-xl border border-emerald-100"
                                                    >
                                                        <CheckCircle2 size={14} /> Acknowledge Alert
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-20 px-10">
                                            <div className="w-32 h-32 rounded-full bg-gray-50 flex items-center justify-center text-gray-200">
                                                <Inbox size={64} />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-xl font-black text-emerald-950 uppercase italic tracking-tighter">Everything Clear</h4>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest max-w-xs">Your personal communication hub is currently synchronized and quiet.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Notices Sidebar */}
                        <div className="lg:col-span-1 space-y-8">
                             <div className="bg-emerald-950 rounded-[2.5rem] p-10 text-white space-y-10 relative overflow-hidden group h-full">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full translate-x-10 -translate-y-10 blur-[80px]"></div>
                                <div className="space-y-2">
                                    <h4 className="text-xl font-black uppercase tracking-[0.2em] text-emerald-500 italic">Instruction Hub</h4>
                                    <p className="text-[10px] font-bold text-emerald-100/40 uppercase tracking-widest">Global Policy Announcements</p>
                                </div>
                                <div className="space-y-6">
                                    <p className="text-xs text-white/60 leading-relaxed font-body">
                                        All faculty communication is logged and preserved in the central archive. Please ensure all broadcasts adhere to institutional protocols.
                                    </p>
                                    <div className="pt-8 border-t border-white/10 flex flex-col gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                                                <Shield size={18} />
                                            </div>
                                            <div className="text-[9px] font-black uppercase tracking-widest">Encrypted Matrix</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-emerald-400">
                                                <Clock size={18} />
                                            </div>
                                            <div className="text-[9px] font-black uppercase tracking-widest">Real-time Sync</div>
                                        </div>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                ) : (
                    /* DISPATCH VIEW - SENDING & HISTORY */
                    <div className="grid lg:grid-cols-2 gap-12">
                        {/* Compose Card */}
                        <section className="space-y-8">
                            <div className="bg-white rounded-[2.5rem] p-10 md:p-14 border border-gray-100 shadow-sm space-y-10 group transition-all duration-500 hover:shadow-xl">
                                <div className="space-y-2">
                                    <h3 className="text-3xl font-black tracking-tighter text-emerald-950 uppercase italic inline-block relative">
                                        Compose Alert
                                        <div className="absolute -bottom-2 left-0 w-full h-1 bg-emerald-500 opacity-20"></div>
                                    </h3>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">
                                        Official communication protocol for assigned scholastics.
                                    </p>
                                </div>

                                <form onSubmit={handleSend} className="space-y-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950 ml-2">Message Metadata</label>
                                        <input 
                                            type="text" 
                                            placeholder="Headline (e.g., Assignment Update)"
                                            className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-emerald-500 text-emerald-950 font-bold placeholder:text-gray-300 transition-all text-sm"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />
                                        <textarea 
                                            placeholder="Full Intelligence Report / Message..."
                                            rows="4"
                                            className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-emerald-500 text-emerald-950 font-bold placeholder:text-gray-300 transition-all resize-none text-sm"
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-6">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950 ml-2">Broadcast Scope</label>
                                        <div className="flex gap-4 p-1 bg-gray-50 rounded-[2rem] border border-gray-100">
                                            <button
                                                type="button"
                                                onClick={() => { setTargetType('Class'); setSelectedStudent(null); }}
                                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all ${
                                                    targetType === 'Class' ? "bg-white text-emerald-600 shadow-md" : "text-gray-400 hover:text-emerald-950"
                                                }`}
                                            >
                                                <Layers size={14} /> Class Matrix
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTargetType('User')}
                                                className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest transition-all ${
                                                    targetType === 'User' ? "bg-white text-emerald-600 shadow-md" : "text-gray-400 hover:text-emerald-950"
                                                }`}
                                            >
                                                <User size={14} /> Precision Alert
                                            </button>
                                        </div>
                                    </div>

                                    {targetType === 'Class' && (
                                        <div className="space-y-4 animate-fade-down duration-500">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950 ml-2">Select Assigned Class</label>
                                            <select 
                                                className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-emerald-500 text-emerald-950 font-bold transition-all text-sm appearance-none"
                                                value={targetId}
                                                onChange={handleClassChange}
                                            >
                                                <option value="">Choose Corridor...</option>
                                                {classes.map(c => (
                                                    <option key={c._id} value={c._id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {targetType === 'User' && (
                                        <div className="space-y-6 animate-fade-down duration-500">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950 ml-2">Target Corridor (Class)</label>
                                                <select 
                                                    className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-emerald-500 text-emerald-950 font-bold transition-all text-sm appearance-none"
                                                    value={targetId}
                                                    onChange={handleClassChange}
                                                >
                                                    <option value="">Choose Class First...</option>
                                                    {classes.map(c => (
                                                        <option key={c._id} value={c._id}>{c.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {targetId && (
                                                <div className="space-y-4 animate-fade-in duration-500">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950 ml-2">Identify Scholar</label>
                                                    {selectedStudent ? (
                                                        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 font-black text-xs">
                                                                    {selectedStudent.name.charAt(0)}
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                    <div className="text-sm font-black text-emerald-950">{selectedStudent.name}</div>
                                                                    <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest italic">{selectedStudent.uniqueId}</div>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => { setSelectedStudent(null); setSearchQuery(""); }}
                                                                className="text-[9px] font-black text-emerald-600 uppercase px-4 py-2 hover:bg-emerald-100 rounded-xl transition-all"
                                                            >
                                                                Reset
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="relative">
                                                                <input 
                                                                    type="text" 
                                                                    placeholder="Search students in this class..."
                                                                    className="w-full px-8 py-5 pl-14 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-emerald-500 text-emerald-950 font-bold transition-all text-sm"
                                                                    value={searchQuery}
                                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                                />
                                                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                                                            </div>
                                                            <div className="max-h-60 overflow-y-auto bg-white rounded-2xl border border-gray-100 shadow-xl p-2 space-y-1 overscroll-contain scrollbar-hide">
                                                                {filteredStudents.length > 0 ? filteredStudents.map(s => (
                                                                    <button
                                                                        key={s._id}
                                                                        type="button"
                                                                        onClick={() => setSelectedStudent(s)}
                                                                        className="w-full p-4 rounded-xl text-left flex items-center justify-between group/row hover:bg-emerald-50 transition-colors"
                                                                    >
                                                                        <div className="space-y-0.5">
                                                                            <div className="text-sm font-black text-emerald-950 italic uppercase">{s.name}</div>
                                                                            <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase italic">{s.uniqueId}</div>
                                                                        </div>
                                                                        <ChevronRight size={14} className="text-gray-300 group-hover/row:translate-x-1 transition-transform" />
                                                                    </button>
                                                                )) : (
                                                                    <div className="p-8 text-center text-gray-400 text-xs font-bold font-display uppercase tracking-widest">No matching scholars.</div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <button 
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-8 rounded-[2rem] bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.4em] shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-4 group"
                                    >
                                        {loading ? "Syncing..." : (
                                            <>
                                                Execute Dispatch
                                                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </section>

                        {/* History Log Card */}
                        <section className="space-y-8">
                            <div className="bg-white rounded-[2.5rem] p-10 md:p-14 border border-gray-100 shadow-sm space-y-10 min-h-[600px] flex flex-col">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-1">
                                        <h3 className="text-3xl font-black tracking-tighter text-emerald-950 uppercase italic leading-none">Sent Records</h3>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Chronicle of Faculty Dispatches</p>
                                    </div>
                                    <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600">
                                        <History size={24} />
                                    </div>
                                </div>

                                <div className="flex-1 space-y-6">
                                    {historyLoading ? (
                                        <div className="h-full flex items-center justify-center text-emerald-600 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Log Archive...</div>
                                    ) : history.length > 0 ? history.map((alert) => (
                                        <div key={alert._id} className="p-8 rounded-[2rem] bg-gray-50/30 border border-transparent hover:border-emerald-100 hover:bg-white transition-all duration-300 group shadow-sm hover:shadow-lg">
                                            <div className="flex justify-between items-start gap-4 mb-4">
                                                <div className="space-y-2 overflow-hidden">
                                                    <h4 className="text-xl font-black text-emerald-950 tracking-tight leading-tight truncate uppercase italic">{alert.title}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">{alert.targetType}: {alert.targetId?.name || "Multiple Scholars"}</span>
                                                    </div>
                                                </div>
                                                <div className="text-[9px] font-bold text-gray-300 whitespace-nowrap pt-1 bg-white px-3 py-1.5 rounded-full border border-gray-50">
                                                    {new Date(alert.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <p className="text-sm font-medium text-gray-500 leading-relaxed font-body line-clamp-2 italic mb-6">
                                                "{alert.message}"
                                            </p>
                                            <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                                                <div className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-gray-50 text-[8px] font-black text-gray-300 uppercase tracking-widest">
                                                    <Clock size={10} className="text-emerald-500" />
                                                    Archived Log
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteSent(alert._id)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-xl"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-20 px-10">
                                            <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center text-gray-200">
                                                <History size={48} />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="text-sm font-black text-emerald-950 uppercase tracking-widest italic">Log Archive Clear</div>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No alerts have been dispatched in this active session.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherNotifications;
