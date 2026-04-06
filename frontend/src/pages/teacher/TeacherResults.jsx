// frontend/src/pages/teacher/TeacherResults.jsx

import React, { useEffect, useState } from "react";
import { 
  Award, Search, ChevronRight, CheckCircle, 
  BookOpen, Activity, User, Fingerprint, 
  Layout, Save, Filter, Star, CheckSquare
} from "lucide-react";
import teacherService from "../../api/teacherService";
import useAuthStore from "../../stores/authStore";
import { toast } from "react-toastify";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/shared/Modal";

const TeacherResults = () => {
    const { token } = useAuthStore();
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");
    const [students, setStudents] = useState([]);
    const [studLoading, setStudLoading] = useState(false);
    const [examName, setExamName] = useState("Mid-Term Examination");
    const [totalMarks, setTotalMarks] = useState(100);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [clsRes, subRes] = await Promise.all([
                teacherService.getAssignedClasses(token),
                teacherService.getAssignedSubjects(token)
            ]);
            setClasses(clsRes || []);
            setSubjects(subRes || []);
        } catch (err) {
            toast.error("Failed to fetch assigned curriculum nodes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    useEffect(() => {
        if (selectedClass) {
            const fetchStudents = async () => {
                setStudLoading(true);
                try {
                    const res = await teacherService.getClassStudents(selectedClass, token);
                    setStudents(res.map(s => ({ ...s, marksObtained: "", grade: "" })) || []);
                } catch (err) {
                    toast.error("Failed to sync student registry.");
                } finally {
                    setStudLoading(false);
                }
            };
            fetchStudents();
        } else {
            setStudents([]);
        }
    }, [selectedClass, token]);

    const handleUpdateMark = (id, field, value) => {
        setStudents(prev => prev.map(s => s._id === id ? { ...s, [field]: value } : s));
    };

    const handleSaveResults = async () => {
        if (!selectedSubject || !selectedClass) return toast.warning("Selection criteria incomplete.");
        
        const resultsToSave = students.filter(s => s.marksObtained !== "");
        if (resultsToSave.length === 0) return toast.warning("No performance data entered.");

        try {
            await Promise.all(resultsToSave.map(s => 
                teacherService.addResult({
                    studentId: s._id,
                    subjectId: selectedSubject,
                    classId: selectedClass,
                    examName,
                    marksObtained: Number(s.marksObtained),
                    totalMarks: Number(totalMarks),
                    grade: s.grade || (Number(s.marksObtained) / totalMarks >= 0.4 ? 'PASS' : 'FAIL')
                }, token)
            ));
            toast.success("Academic performance recorded successfully.");
        } catch (err) {
            toast.error("Failed to commit results to database.");
        }
    };

    if (loading) return <div className="p-20 flex items-center justify-center min-h-screen animate-pulse"><Spinner size="xl" /></div>;

    return (
        <div className="min-h-screen bg-emerald-50/20 pb-40 relative overflow-hidden font-body">
            <header className="px-8 md:px-14 pt-16 relative z-10 space-y-8 mb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-px bg-emerald-600"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Assignment Management</span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-emerald-950 tracking-tighter uppercase italic leading-none">
                            Assess <span className="text-white">Work.</span>
                        </h1>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <button 
                            onClick={handleSaveResults}
                            disabled={students.length === 0}
                            className="px-10 py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-4 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-950/20 disabled:opacity-50 flex items-center gap-4"
                        >
                            <CheckSquare size={16}/> Commit Results
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm shadow-emerald-950/5">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/40 ml-1">Subject Axis</label>
                        <select 
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:border-emerald-100 focus:bg-white outline-none text-xs font-black uppercase italic transition-all"
                            value={selectedSubject}
                            onChange={(e) => {
                                const subId = e.target.value;
                                setSelectedSubject(subId);
                                const sub = subjects.find(s => s._id === subId);
                                if (sub) {
                                    setSelectedClass(sub.classId?._id || sub.classId);
                                }
                            }}
                        >
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.classId ? `${s.classId.name}${s.classId.stream !== 'General' ? ` (${s.classId.stream})` : ''}` : 'Assigned Axis'})</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/40 ml-1">Target Class</label>
                        <select 
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent outline-none text-xs font-black uppercase italic cursor-not-allowed text-emerald-950/40"
                            value={selectedClass}
                            disabled
                        >
                            <option value="">Select Class</option>
                            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/40 ml-1">Exam Label</label>
                        <input 
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:border-emerald-100 focus:bg-white outline-none text-xs font-black uppercase italic transition-all"
                            value={examName}
                            onChange={(e) => setExamName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-emerald-950/40 ml-1">Total marks</label>
                        <input 
                            type="number"
                            className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-transparent focus:border-emerald-100 focus:bg-white outline-none text-xs font-black transition-all"
                            value={totalMarks}
                            onChange={(e) => setTotalMarks(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="px-8 md:px-14 relative z-10">
                {studLoading ? (
                    <div className="py-20 flex justify-center"><Spinner size="xl" /></div>
                ) : students.length === 0 ? (
                    <div className="py-32 text-center bg-white rounded-3xl border border-dashed border-gray-100 flex flex-col items-center justify-center text-center space-y-6 shadow-sm shadow-emerald-950/5">
                        <Award size={48} className="text-gray-100" />
                        <div className="space-y-2">
                            <p className="text-lg font-black uppercase italic text-emerald-950 tracking-tighter">Academic Jurisdiction Empty</p>
                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Select a subject axis to initiate student evaluation.</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm shadow-emerald-950/5 overflow-hidden animate-fade-up">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-emerald-50/[0.3] border-b border-gray-100">
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-emerald-950/30">Student Identity</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-emerald-950/30">Unique ID</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-emerald-950/30">Performance (/{totalMarks})</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-emerald-950/30 text-right pr-14">Grade Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {students.map(s => (
                                    <tr key={s._id} className="group hover:bg-emerald-50/20 transition-colors duration-500">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 text-emerald-600 flex items-center justify-center font-black italic uppercase group-hover:bg-white transition-all shadow-sm">
                                                    {s.name.charAt(0)}
                                                </div>
                                                <span className="text-sm font-black text-emerald-950 uppercase italic tracking-tight">{s.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-[10px] font-black text-gray-300 tabular-nums uppercase italic tracking-widest bg-gray-50/30 group-hover:bg-transparent">#{s.uniqueId}</td>
                                        <td className="px-8 py-6">
                                            <div className="relative w-24 group/input">
                                                <input 
                                                    type="number"
                                                    placeholder="---"
                                                    className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-emerald-100 group-hover:bg-white outline-none focus:ring-4 focus:ring-emerald-50/50 text-center font-black tabular-nums transition-all"
                                                    value={s.marksObtained}
                                                    onChange={(e) => handleUpdateMark(s._id, 'marksObtained', e.target.value)}
                                                />
                                                <div className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center opacity-0 group-focus-within/input:opacity-100 transition-opacity">
                                                    <Star size={10} fill="currentColor" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right pr-14">
                                            <input 
                                                type="text"
                                                placeholder="GRAD"
                                                className="w-24 px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-emerald-100 group-hover:bg-white outline-none focus:ring-4 focus:ring-emerald-50/50 text-center font-black uppercase italic transition-all placeholder:text-gray-200"
                                                value={s.grade}
                                                onChange={(e) => handleUpdateMark(s._id, 'grade', e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherResults;
