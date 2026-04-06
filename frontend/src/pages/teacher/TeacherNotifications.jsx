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
    CheckCircle2
} from "lucide-react";
import useAuthStore from "../../stores/authStore";
import teacherService from "../../api/teacherService";
import notificationService from "../../api/notificationService";
import { toast } from "react-toastify";

const TeacherNotifications = () => {
    const { token } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [history, setHistory] = useState([]);
    
    // Form State
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [targetType, setTargetType] = useState("Class");
    const [targetId, setTargetId] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    
    // Selection Data
    const [classes, setClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

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

    const handleDelete = async (id) => {
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
        fetchHistory();
        fetchTeacherData();
    }, []);

    useEffect(() => {
        if (targetType === 'Class' || targetType === 'User') {
            // If user selects a class, we might want to narrow students
            // But let's keep it simple: if targetType is User, show student search
        }
    }, [targetType]);

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
        <div className="min-h-screen bg-emerald-50/20 space-y-12 pb-24 relative overflow-hidden font-body">
            {/* Hero Header */}
            <header className="px-8 md:px-14 pt-16 space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Faculty Communication Hub</span>
                </div>
                <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter leading-none text-emerald-950">
                    Dispatch <span className="text-emerald-100 italic">Alerts.</span>
                </h1>
            </header>

            <div className="px-4 sm:px-8 md:px-14 grid lg:grid-cols-2 gap-12 relative z-10 w-full overflow-x-hidden box-border">
                {/* Dispatch Control */}
                <section className="space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-10 md:p-14 border border-gray-100 shadow-sm space-y-10 group transition-all duration-500 hover:shadow-xl">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black tracking-tighter text-emerald-950 uppercase italic underline decoration-emerald-500/20 underline-offset-8">Compose Alert</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-loose">
                                Official communication protocol for assigned scholastics.
                            </p>
                        </div>

                        <form onSubmit={handleSend} className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950 ml-2">Message Metadata</label>
                                <input 
                                    type="text" 
                                    placeholder="Alert Headline"
                                    className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-emerald-500 text-emerald-950 font-bold placeholder:text-gray-300 transition-all"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <textarea 
                                    placeholder="Full Message Content..."
                                    rows="4"
                                    className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-emerald-500 text-emerald-950 font-bold placeholder:text-gray-300 transition-all resize-none"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            <div className="space-y-6">
                                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950 ml-2">Recipients</label>
                                <div className="flex gap-4 p-1 bg-gray-50 rounded-[2rem] border border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => { setTargetType('Class'); setSelectedStudent(null); }}
                                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                                            targetType === 'Class' ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400 hover:text-emerald-950"
                                        }`}
                                    >
                                        <Layers size={14} /> Class Broadcast
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setTargetType('User')}
                                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                                            targetType === 'User' ? "bg-white text-emerald-600 shadow-sm" : "text-gray-400 hover:text-emerald-950"
                                        }`}
                                    >
                                        <User size={14} /> Private Alert
                                    </button>
                                </div>
                            </div>

                            {targetType === 'Class' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950 ml-2">Identify Corridor</label>
                                    <select 
                                        className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-emerald-500 text-emerald-950 font-bold transition-all"
                                        value={targetId}
                                        onChange={handleClassChange}
                                    >
                                        <option value="">Select Assigned Class...</option>
                                        {classes.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {targetType === 'User' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950 ml-2">Select Target Classroom</label>
                                        <select 
                                            className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-emerald-500 text-emerald-950 font-bold transition-all"
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
                                        <div className="space-y-4 animate-in fade-in duration-500">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950 ml-2">Identify Scholar</label>
                                            {selectedStudent ? (
                                                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between group/sel">
                                                    <div className="flex items-center gap-4">
                                                        <CheckCircle2 className="text-emerald-600" size={20} />
                                                        <div className="space-y-1">
                                                            <div className="text-sm font-black text-emerald-950">{selectedStudent.name}</div>
                                                            <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest italic">{selectedStudent.uniqueId}</div>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => { setSelectedStudent(null); setSearchQuery(""); }}
                                                        className="text-[10px] font-black text-emerald-600 uppercase px-4 py-2 hover:bg-emerald-100 rounded-xl transition-all"
                                                    >
                                                        Change
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="relative">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Filter students in this class..."
                                                            className="w-full px-8 py-5 pl-14 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-emerald-500 text-emerald-950 font-bold transition-all"
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                        />
                                                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                                    </div>
                                                    <div className="max-h-60 overflow-y-auto bg-white rounded-2xl border border-gray-100 shadow-xl p-2 space-y-1 scrollbar-hide">
                                                        {filteredStudents.length > 0 ? filteredStudents.map(s => (
                                                            <button
                                                                key={s._id}
                                                                type="button"
                                                                onClick={() => setSelectedStudent(s)}
                                                                className="w-full p-4 rounded-xl text-left flex items-center justify-between group/row hover:bg-emerald-50 transition-colors"
                                                            >
                                                                <div className="space-y-0.5">
                                                                    <div className="text-sm font-black text-emerald-950">{s.name}</div>
                                                                    <div className="text-[10px] font-bold text-gray-400 tracking-widest uppercase italic">{s.uniqueId}</div>
                                                                </div>
                                                                <ChevronRight size={14} className="text-gray-300 group-hover/row:translate-x-1 transition-transform" />
                                                            </button>
                                                        )) : (
                                                            <div className="p-8 text-center text-gray-400 text-xs font-bold">No students found in this hub.</div>
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
                                {loading ? "Dispatching..." : (
                                    <>
                                        Execute Alert Dispatch
                                        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </section>

                {/* Dispatch Log */}
                <section className="space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-10 md:p-14 border border-gray-100 shadow-sm space-y-10 min-h-[600px] flex flex-col">
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <h3 className="text-3xl font-black tracking-tighter text-emerald-950 uppercase italic">Dispatch Archive</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Chronicle of Faculty Broadcasts</p>
                            </div>
                            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                                <Bell size={20} />
                            </div>
                        </div>

                        <div className="flex-1 space-y-6">
                            {historyLoading ? (
                                <div className="h-full flex items-center justify-center text-emerald-600 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing Dispatch Archive...</div>
                            ) : history.length > 0 ? history.map((alert) => (
                                <div key={alert._id} className="p-8 rounded-[2rem] bg-gray-50/50 border border-transparent hover:border-emerald-100 hover:bg-emerald-50/30 transition-all duration-300 group shadow-sm hover:shadow-md">
                                    <div className="flex justify-between items-start gap-4 mb-4">
                                        <div className="space-y-1 overflow-hidden">
                                            <h4 className="text-xl font-black text-emerald-950 tracking-tight leading-tight truncate">{alert.title}</h4>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">{alert.targetType}: {alert.targetId?.name || "Multiple Scholars"}</span>
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
                                            <Clock size={10} className="text-emerald-500" />
                                            Active System Log
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
                                    <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-200">
                                        <Bell size={40} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm font-black text-emerald-950 uppercase tracking-widest">Archive Empty</div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">No alerts dispatched in this session.</div>
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

export default TeacherNotifications;
