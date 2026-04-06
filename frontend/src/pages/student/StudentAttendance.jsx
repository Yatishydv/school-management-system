// frontend/src/pages/student/StudentAttendance.jsx

import React, { useState, useEffect } from 'react';
import useAuthStore from '../../stores/authStore';
import studentService from '../../api/studentService';
import { toast } from 'react-toastify';
import { 
    Calendar, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    ChevronRight, 
    Layout, 
    ShieldCheck,
    TrendingUp,
    Filter
} from 'lucide-react';
import Spinner from '../../components/ui/Spinner';

const StudentAttendance = () => {
    const { token } = useAuthStore();
    const [records, setRecords] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All'); // All, Present, Absent, Late

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [history, attendanceStats] = await Promise.all([
                    studentService.getAttendanceHistory(token),
                    studentService.getAttendanceStats(token)
                ]);
                setRecords(history);
                setStats(attendanceStats);
            } catch (err) {
                toast.error("Failed to synchronize attendance data.");
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchData();
    }, [token]);

    const filteredRecords = records.filter(r => 
        filter === 'All' ? true : r.status === filter
    );

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-blue-50/20">
                <Spinner size="xl" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 animate-pulse">Retrieving Presence Logs...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-blue-50/20 pb-24 relative overflow-hidden font-body">
            {/* Background Decal */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 text-[12vw] font-black text-blue-900/[0.02] pointer-events-none select-none tracking-tighter uppercase whitespace-nowrap -rotate-6">
                PRESENCE HISTORY
            </div>

            <div className="px-8 md:px-14 pt-16 relative z-10 space-y-12">
                <header className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-px bg-blue-600"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Attendance Tracker</span>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none text-blue-950 uppercase italic">
                            My <span className="text-gray-200">History.</span>
                        </h1>
                        
                        <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-white/50 shadow-sm">
                            {['All', 'Present', 'Absent', 'Late'].map(f => (
                                <button 
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:text-blue-600'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Classes</p>
                            <p className="text-4xl font-black text-blue-950 tabular-nums">{stats?.total || 0}</p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Layout size={24} />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Presence Rate</p>
                            <p className="text-4xl font-black text-emerald-600 tabular-nums">{stats?.percentage || 0}%</p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ShieldCheck size={24} />
                        </div>
                    </div>

                    <div className="bg-blue-950 p-8 rounded-[2.5rem] shadow-xl shadow-blue-950/20 flex items-center justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full translate-x-10 -translate-y-10 blur-2xl"></div>
                        <div className="space-y-2 relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-300/60">Status</p>
                            <p className="text-2xl font-black text-white uppercase italic tracking-tighter">Consistent</p>
                        </div>
                        <TrendingUp size={32} className="text-blue-400 relative z-10" />
                    </div>
                </div>

                {/* Records List */}
                <div className="space-y-6">
                    {filteredRecords.length > 0 ? (
                        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
                            <table className="w-full border-separate border-spacing-0">
                                <thead className="bg-blue-50/30">
                                    <tr className="text-left text-[10px] font-black uppercase tracking-[0.4em] text-blue-950/30 border-b border-gray-100">
                                        <th className="px-10 py-8">Temporal Key (Date)</th>
                                        <th className="px-10 py-8">Academic Unit (Class)</th>
                                        <th className="px-10 py-8 text-right pr-14">Status Axis</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredRecords.map((r, i) => (
                                        <tr key={i} className="group hover:bg-blue-50/20 transition-all duration-300">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-50 text-blue-600 flex items-center justify-center group-hover:bg-white transition-all shadow-sm">
                                                        <Calendar size={16} />
                                                    </div>
                                                    <p className="font-black text-blue-950 uppercase italic tracking-tight">
                                                        {new Date(r.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-4 py-2 rounded-xl tracking-widest uppercase group-hover:bg-white transition-all">
                                                    {r.classId?.name || "Global Module"}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8 text-right pr-14">
                                                <div className={`inline-flex items-center gap-3 px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest italic transition-all ${
                                                    r.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 
                                                    r.status === 'Absent' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                    {r.status === 'Present' ? <CheckCircle2 size={12} /> : 
                                                     r.status === 'Absent' ? <XCircle size={12} /> : <Clock size={12} />}
                                                    {r.status}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="h-96 flex flex-col items-center justify-center bg-white rounded-[3rem] border border-dashed border-gray-100 shadow-sm space-y-6 text-center p-12">
                            <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-200">
                                <Filter size={40} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-sm font-black text-blue-600 uppercase italic tracking-widest">No Records Found</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest line-relaxed max-w-xs">Your academic footprint for the selected criteria is currently blank.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentAttendance;
