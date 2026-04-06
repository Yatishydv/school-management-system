// frontend/src/pages/teacher/TeacherAttendance.jsx

import React, { useState, useEffect } from 'react';
import useAuthStore from '../../stores/authStore';
import teacherService from '../../api/teacherService';
import { toast } from 'react-toastify';
import { 
    Users, 
    CheckCircle2, 
    XCircle, 
    Calendar, 
    Layout, 
    CheckSquare, 
    ShieldCheck,
    RefreshCw,
    UserCheck,
    Award
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

const TeacherAttendance = () => {
    const { token, user } = useAuthStore();
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [students, setStudents] = useState([]);
    const [attendance, setAttendance] = useState({}); // { studentId: 'Present' | 'Absent' }
    const [loading, setLoading] = useState(false);
    const [fetchingStudents, setFetchingStudents] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Head of Class Logic
    const [headInfo, setHeadInfo] = useState(null);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await teacherService.getAssignedClasses(token);
                setClasses(res || []);
            } catch (err) {
                toast.error("Failed to retrieve structural nodes.");
            }
        };
        if (token) fetchClasses();
    }, [token]);

    useEffect(() => {
        const fetchHeadAndStudents = async () => {
            if (!selectedClass) return;
            setFetchingStudents(true);
            try {
                // Parallel fetch for speed
                const [studentsRes, headRes] = await Promise.all([
                    teacherService.getClassStudents(selectedClass, token),
                    teacherService.getHeadOfClassInfo(selectedClass, date, token)
                ]);

                setStudents(studentsRes || []);
                setHeadInfo(headRes);

                // Default attendance state
                const initial = {};
                studentsRes.forEach(s => initial[s._id] = 'Present');
                setAttendance(initial);

                // If some attendance already exists for today, fetch it to show current state
                const existing = await teacherService.getAttendanceRecords(selectedClass, date, token);
                if (existing && existing.length > 0) {
                    const mapped = {};
                    existing.forEach(r => mapped[r.studentId?._id || r.studentId] = r.status);
                    setAttendance(prev => ({ ...prev, ...mapped }));
                }

            } catch (err) {
                toast.error("Telemetry failure for target class.");
            } finally {
                setFetchingStudents(false);
            }
        };
        fetchHeadAndStudents();
    }, [selectedClass, date, token]);



    const handleStatusChange = (studentId, status) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSync = async () => {
        if (!selectedClass) return;
        setSyncing(true);
        try {
            const existing = await teacherService.getAttendanceRecords(selectedClass, date, token);
            if (!existing || existing.length === 0) {
                toast.info("No main attendance records found to synchronize.");
                return;
            }
            const mapped = {};
            existing.forEach(r => mapped[r.studentId?._id || r.studentId] = r.status);
            setAttendance(prev => ({ ...prev, ...mapped }));
            toast.success("Synchronized with Head of Class records.");
        } catch (err) {
            toast.error("Synchronization failed.");
        } finally {
            setSyncing(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedClass) return toast.error("Select a target class first.");
        
        setLoading(true);
        try {
            const records = Object.entries(attendance).map(([studentId, status]) => ({
                studentId,
                status
            }));

            await teacherService.markAttendance({
                classId: selectedClass,
                attendanceData: records,
                date
            }, token);

            toast.success("Attendance successfully committed to registry.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Data transmission failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-emerald-50/20 pb-24 relative overflow-hidden font-body">
            <div className="px-8 md:px-14 pt-16 relative z-10 space-y-12">
                <header className="space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-px bg-emerald-600"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Institutional Presence</span>
                    </div>
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                        <div className="space-y-2">
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-emerald-950 uppercase italic">
                                Registry <span className="text-gray-200">Suite.</span>
                            </h1>
                            <p className="text-[10px] font-bold text-emerald-950/40 uppercase tracking-[0.3em] ml-1">
                                High-fidelity attendance management for academic excellence.
                            </p>
                        </div>

                        <div className="flex gap-4">
                            {!headInfo?.isFirstPeriod && students.length > 0 && (
                                <button 
                                    onClick={handleSync}
                                    disabled={syncing}
                                    className="px-8 py-5 bg-white border border-emerald-100 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center gap-4 shadow-sm"
                                >
                                    {syncing ? <RefreshCw size={16} className="animate-spin" /> : <><RefreshCw size={16}/> Sync from Head</>}
                                </button>
                            )}
                            <button 
                                onClick={handleSubmit}
                                disabled={loading || students.length === 0}
                                className="px-10 py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-4"
                            >
                                {loading ? <Spinner size="xs" /> : <><CheckSquare size={16}/> Commit To Database</>}
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-10">
                    {/* Controls Sidebar */}
                    <div className="lg:w-96 space-y-8 flex-shrink-0">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/30 ml-1">Select Academic Group</label>
                                <select 
                                    value={selectedClass}
                                    onChange={(e) => setSelectedClass(e.target.value)}
                                    className="w-full bg-emerald-50/50 border-none rounded-xl px-6 py-4 text-xs font-black text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer"
                                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23064e3b\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1rem' }}
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(c => (
                                        <option key={c._id} value={c._id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/30 ml-1">Archive Date</label>
                                <div className="relative">
                                    <input 
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-emerald-50/50 border-none rounded-xl px-6 py-4 text-xs font-black text-emerald-950 outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                                    />
                                    <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-900/20 pointer-events-none" size={18} />
                                </div>
                            </div>
                        </div>

                        {selectedClass && headInfo && (
                             <div className={`p-6 rounded-2xl border flex items-center justify-between shadow-sm transition-all duration-500 ${headInfo.isFirstPeriod ? 'bg-emerald-950 text-white border-emerald-900' : 'bg-white border-gray-100 text-emerald-950'}`}>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Award size={14} className={headInfo.isFirstPeriod ? 'text-emerald-400' : 'text-emerald-600'} />
                                        <p className={`text-[9px] font-black uppercase tracking-widest ${headInfo.isFirstPeriod ? 'opacity-60' : 'opacity-30'}`}>{headInfo.isFirstPeriod ? 'You are today\'s Head' : 'Current Class Head'}</p>
                                    </div>
                                    <p className="text-sm font-black uppercase italic tracking-tight">{headInfo.headOfClass?.name || "System Offline"}</p>
                                    <p className={`text-[9px] font-bold uppercase tracking-widest ${headInfo.isFirstPeriod ? 'opacity-40' : 'opacity-20'}`}>Period: {headInfo.periodName}</p>
                                </div>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${headInfo.isFirstPeriod ? 'bg-white/10' : 'bg-emerald-50'}`}>
                                    <UserCheck size={24} className={headInfo.isFirstPeriod ? 'text-emerald-400' : 'text-emerald-600'} />
                                </div>
                             </div>
                        )}
                    </div>

                    {/* Students List */}
                    <div className="flex-1">
                        {fetchingStudents ? (
                            <div className="h-[32rem] flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
                                <Spinner size="xl" />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600 animate-pulse">Syncing Structural Data...</p>
                            </div>
                        ) : students.length > 0 ? (
                            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-fade-up">
                                <table className="w-full border-separate border-spacing-0">
                                    <thead className="bg-emerald-50/10">
                                        <tr className="text-left text-[10px] font-black uppercase tracking-[0.4em] text-emerald-950/30 border-b border-gray-100">
                                            <th className="px-8 py-6">Scholar Identity</th>
                                            <th className="px-8 py-6">System ID</th>
                                            <th className="px-8 py-6 text-right pr-12">Presence Matrix</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {students.map(s => (
                                            <tr key={s._id} className="group hover:bg-emerald-50/5 transition-all duration-300">
                                                <td className="px-8 py-6 flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-xl bg-gray-50 text-emerald-600 flex items-center justify-center font-black italic border border-gray-100 text-base group-hover:bg-white transition-all shadow-sm group-hover:scale-105">
                                                        {s.profileImage ? (
                                                            <img src={`http://localhost:5005/${s.profileImage}`} className="w-full h-full object-cover rounded-xl" alt={s.name} />
                                                        ) : s.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-emerald-950 uppercase italic tracking-tight text-base leading-none">{s.name}</p>
                                                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-1">Roll: {s.rollNumber || "UNSPECIFIED"}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-lg tracking-widest italic">{s.uniqueId}</span>
                                                </td>
                                                <td className="px-8 py-6 text-right pr-12">
                                                    <div className="inline-flex bg-gray-50 p-1.5 rounded-2xl gap-2 border border-gray-100 shadow-sm group-hover:bg-white transition-all">
                                                        <button 
                                                            onClick={() => handleStatusChange(s._id, 'Present')}
                                                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${attendance[s._id] === 'Present' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/20' : 'text-gray-400 hover:text-emerald-600'}`}
                                                        >
                                                            <CheckCircle2 size={12} /> Present
                                                        </button>
                                                        <button 
                                                            onClick={() => handleStatusChange(s._id, 'Absent')}
                                                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${attendance[s._id] === 'Absent' ? 'bg-red-600 text-white shadow-lg shadow-red-950/20' : 'text-gray-400 hover:text-red-600'}`}
                                                        >
                                                            <XCircle size={12} /> Absent
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : selectedClass ? (
                             <div className="h-[32rem] flex flex-col items-center justify-center bg-white rounded-[4rem] border border-dashed border-emerald-100 space-y-8 text-center p-16 shadow-sm">
                                <Users size={64} className="text-emerald-50" />
                                <div className="space-y-3">
                                    <p className="text-xl font-black text-emerald-950/20 uppercase italic tracking-widest">Structural Void</p>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest line-relaxed max-w-xs">This academic node contains no registered students at this coordinate.</p>
                                </div>
                             </div>
                        ) : (
                            <div className="h-[32rem] flex flex-col items-center justify-center bg-white rounded-[4rem] border border-dashed border-emerald-100 shadow-sm space-y-8 text-center p-16">
                                <div className="w-24 h-24 rounded-[2rem] bg-emerald-50 flex items-center justify-center text-emerald-200">
                                    <Layout size={48} />
                                </div>
                                <div className="space-y-3">
                                    <p className="text-xl font-black text-emerald-600 uppercase italic tracking-widest">Await Selection</p>
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest line-relaxed max-w-xs">Select a target academic unit to begin institutional attendance logging.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherAttendance;
