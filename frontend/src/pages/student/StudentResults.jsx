// frontend/src/pages/student/StudentResults.jsx

import React, { useEffect, useState } from "react";
import { 
  Award, Star, TrendingUp, BookOpen, 
  ChevronRight, ArrowUpRight, Activity, 
  Shield, Layers, Download, Check, ShieldCheck,
  Target, GraduationCap
} from "lucide-react";
import studentService from "../../api/studentService";
import useAuthStore from "../../stores/authStore";
import { toast } from "react-toastify";
import Spinner from "../../components/ui/Spinner";

const StudentResults = () => {
    const { token } = useAuthStore();
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await studentService.getAllResults(token);
                setResults(res || []);
            } catch (err) {
                toast.error("Failed to fetch academic assessments.");
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchData();
    }, [token]);

    const getGradeColor = (marks, total) => {
        const perc = (marks / total) * 100;
        if (perc >= 90) return "text-green-600 bg-green-50 border-green-100";
        if (perc >= 75) return "text-blue-600 bg-blue-50 border-blue-100";
        if (perc >= 50) return "text-orange-600 bg-orange-50 border-orange-100";
        return "text-red-600 bg-red-50 border-red-100";
    };

    if (loading) return <div className="p-20 flex items-center justify-center min-h-screen animate-pulse"><Spinner size="xl" /></div>;

    const avgPerformance = results.length > 0 
        ? (results.reduce((acc, r) => acc + (r.marksObtained / r.totalMarks), 0) / results.length * 100).toFixed(1)
        : 0;

    return (
        <div className="min-h-screen bg-gray-50/20 pb-40 relative overflow-hidden font-body">
            {/* Decal */}
            <div className="absolute top-20 right-[-10%] text-[20vw] font-black text-blue-950/[0.03] pointer-events-none select-none tracking-tighter uppercase whitespace-nowrap rotate-90">
                TRANSCRIPT
            </div>

            <header className="px-8 md:px-14 pt-16 relative z-10 space-y-12 mb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-px bg-blue-600"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Academic Achievements</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-blue-950 tracking-tighter uppercase italic leading-none">
                            My <span className="text-gray-200">Results.</span>
                        </h1>
                    </div>

                    <div className="p-10 bg-blue-950 rounded-[3rem] text-white flex items-center gap-10 shadow-2xl shadow-blue-900/20 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-700"></div>
                        <div className="w-20 h-20 rounded-[2rem] bg-white/10 flex items-center justify-center text-blue-400 group-hover:rotate-12 transition-all">
                            <TrendingUp size={40} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1">Aggregate Velocity</p>
                            <p className="text-5xl font-black italic tabular-nums tracking-tighter">{avgPerformance}%</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="px-8 md:px-14 relative z-10">
                {results.length === 0 ? (
                    <div className="py-40 bg-white rounded-[4rem] border border-dashed border-gray-100 flex flex-col items-center justify-center text-center gap-8 shadow-sm">
                        <Activity size={48} className="text-gray-100 animate-pulse" />
                        <div className="space-y-2">
                           <p className="text-sm font-black uppercase italic text-blue-950 tracking-tighter">Evaluative Cycle Pending</p>
                           <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">No academic assessment nodes recorded in current archive.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        {results.map(res => (
                            <div key={res._id} className="group bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col md:flex-row items-center justify-between gap-10 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-0 bg-blue-600 group-hover:h-full transition-all duration-500"></div>
                                
                                <div className="flex items-center gap-8 relative z-10">
                                    <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center text-blue-950 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:scale-110 duration-500 shadow-sm">
                                        <GraduationCap size={32} />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Examination Unit: {res.examName}</span>
                                        </div>
                                        <h3 className="text-3xl md:text-4xl font-black text-blue-950 tracking-tighter uppercase italic group-hover:translate-x-2 transition-transform duration-500 leading-none">{res.subjectId?.name || 'Academic Course'}</h3>
                                        <div className="px-3 py-1 bg-blue-50/50 rounded-lg inline-block text-[9px] font-black text-blue-400 uppercase tracking-widest border border-blue-50 italic">
                                            Subject Node: {res.subjectId?.code || 'SUB-000'}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-16 relative z-10 w-full md:w-auto mt-6 md:mt-0 pt-8 md:pt-0 border-t md:border-none border-gray-50">
                                    <div className="text-right flex-1 md:flex-none">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-2">Metrics Analysis</p>
                                        <div className="flex items-end justify-end gap-3 group-hover:scale-110 transition-transform origin-right">
                                            <span className="text-5xl font-black text-blue-950 tabular-nums italic tracking-tighter">{res.marksObtained}</span>
                                            <span className="text-lg font-black text-gray-200 uppercase tabular-nums mb-1 opacity-60">/ {res.totalMarks}</span>
                                        </div>
                                    </div>
                                    <div className={`px-12 py-6 rounded-[2rem] border-2 shadow-sm text-2xl font-black uppercase italic tracking-tighter flex items-center gap-4 transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent ${getGradeColor(res.marksObtained, res.totalMarks)}`}>
                                        <ShieldCheck size={28} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                        {res.grade || (res.marksObtained / res.totalMarks >= 0.4 ? 'PASS' : 'FAIL')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentResults;
