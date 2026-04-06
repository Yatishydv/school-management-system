// frontend/src/pages/teacher/TeacherAssignments.jsx

import React, { useEffect, useState } from "react";
import { 
  FileText, Plus, Trash2, CheckCircle, 
  Clock, Download, Send, Search, 
  Calendar as CalendarIcon, User, Filter, AlertCircle,
  ChevronRight, ArrowRight, BookOpen, Layers, CheckSquare
} from "lucide-react";
import teacherService from "../../api/teacherService";
import useAuthStore from "../../stores/authStore";
import { toast } from "react-toastify";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/shared/Modal";

const TeacherAssignments = () => {
    const { token } = useAuthStore();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmissionsModalOpen, setIsSubmissionsModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [subsLoading, setSubsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        subjectId: "",
        classId: "",
        dueDate: "",
        file: null
    });
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [asmRes, subRes, clsRes] = await Promise.all([
                teacherService.getAssignments(token),
                teacherService.getAssignedSubjects(token),
                teacherService.getAssignedClasses(token)
            ]);
            setAssignments(asmRes || []);
            setSubjects(subRes || []);
            setClasses(clsRes || []);
        } catch (err) {
            toast.error("Failed to sync assignment archive.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const handleCreate = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) data.append(key, formData[key]);
        });

        try {
            await teacherService.createAssignment(data, token);
            toast.success("Assignment deployed successfully.");
            setIsCreateModalOpen(false);
            setFormData({ title: "", description: "", subjectId: "", classId: "", dueDate: "", file: null });
            fetchData();
        } catch (err) {
            toast.error("Failed to publish assignment.");
        }
    };

    const handleViewSubmissions = async (asm) => {
        setSelectedAssignment(asm);
        setIsSubmissionsModalOpen(true);
        setSubsLoading(true);
        try {
            const res = await teacherService.getSubmissions(asm._id, token);
            setSubmissions(res || []);
        } catch (err) {
            toast.error("Failed to fetch student submissions.");
        } finally {
            setSubsLoading(false);
        }
    };

    const handleGrade = async (studentId, grade, feedback) => {
        try {
            await teacherService.gradeSubmission(selectedAssignment._id, { studentId, grade, feedback }, token);
            toast.success("Grade recorded.");
            // Refresh submissions
            const res = await teacherService.getSubmissions(selectedAssignment._id, token);
            setSubmissions(res || []);
        } catch (err) {
            toast.error("Failed to save grade.");
        }
    };

    if (loading) return <div className="p-20 flex items-center justify-center min-h-screen animate-pulse"><Spinner size="xl" /></div>;

    return (
        <div className="min-h-screen bg-emerald-50/20 pb-40 relative overflow-hidden font-body">
            <header className="px-8 md:px-14 pt-16 relative z-10 space-y-12 mb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-px bg-emerald-600"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Assignment Management</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-emerald-950 tracking-tighter uppercase italic leading-none">
                            Assess <span className="text-gray-200">Work.</span>
                        </h1>
                    </div>

                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-10 py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-4 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/20 flex items-center gap-4"
                    >
                        <Plus size={16}/> New Task
                    </button>
                </div>
            </header>

            <div className="px-8 md:px-14 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {assignments.map(asm => (
                        <div key={asm._id} className="group bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm shadow-emerald-950/5 hover:shadow-2xl transition-all duration-700 flex flex-col justify-between relative overflow-hidden">
                            {/* Hover Accent */}
                            <div className="absolute top-0 left-0 w-2 h-0 bg-emerald-600 group-hover:h-full transition-all duration-500"></div>
                            
                            <div className="space-y-8 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all transform group-hover:scale-110 duration-500 shadow-sm">
                                        <FileText size={28} />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 mb-1">Due Date</span>
                                        <div className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black tabular-nums border border-emerald-100 italic transition-all group-hover:bg-emerald-600 group-hover:text-white group-hover:border-transparent">
                                            {new Date(asm.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="px-3 py-1 bg-gray-50 text-[9px] font-black uppercase tracking-widest text-emerald-950/40 border border-gray-100 rounded-lg group-hover:bg-white transition-all">
                                            {asm.class?.name || 'Assigned'}
                                        </div>
                                        <div className="px-3 py-1 bg-emerald-50/30 text-[9px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-50 rounded-lg group-hover:bg-white transition-all">
                                            {asm.subject?.name || 'Curriculum'}
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-emerald-950 tracking-tighter uppercase italic group-hover:translate-x-2 transition-transform duration-500 leading-none">{asm.title}</h3>
                                    <p className="text-[10px] font-medium text-gray-400 line-clamp-2 leading-relaxed">{asm.description || "No procedural documentation provided for this specific task node."}</p>
                                </div>
                            </div>

                            <div className="pt-10 mt-10 border-t border-gray-50 flex items-center justify-between relative z-10">
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Submissions</span>
                                    <span className="text-xl font-black text-emerald-600 tabular-nums italic group-hover:scale-110 transition-transform origin-left">{asm.submissions?.length || 0}</span>
                                </div>
                                <button 
                                    onClick={() => handleViewSubmissions(asm)}
                                    className="p-4 bg-gray-50 text-emerald-950 rounded-[1.5rem] hover:bg-emerald-600 hover:text-white transition-all shadow-sm group-hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-950/20"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CREATE MODAL */}
            {isCreateModalOpen && (
                <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Assignment">
                    <form onSubmit={handleCreate} className="space-y-8 p-4 font-body">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 ml-1">Task Title</label>
                            <input 
                                className="w-full px-8 py-5 bg-gray-50 rounded-[1.5rem] border border-transparent focus:border-emerald-100 focus:bg-white shadow-inner outline-none text-sm font-black transition-all"
                                value={formData.title}
                                placeholder="e.g. Structural Mechanics Thesis"
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 ml-1">Subject</label>
                                <select 
                                    className="w-full px-8 py-5 bg-gray-50 rounded-[1.5rem] border border-transparent focus:border-emerald-100 focus:bg-white outline-none text-xs font-black uppercase italic transition-all appearance-none cursor-pointer"
                                    value={formData.subjectId}
                                    onChange={(e) => {
                                        const subId = e.target.value;
                                        const sub = subjects.find(s => s._id === subId);
                                        setFormData({
                                            ...formData, 
                                            subjectId: subId, 
                                            classId: sub ? (sub.classId?._id || sub.classId) : ""
                                        });
                                    }}
                                    required
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.classId ? `${s.classId.name}${s.classId.stream !== 'General' ? ` (${s.classId.stream})` : ''}` : 'Unmapped'})</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 ml-1">Due Date</label>
                                <input 
                                    type="date"
                                    className="w-full px-8 py-5 bg-gray-50 rounded-[1.5rem] border border-transparent focus:border-emerald-100 focus:bg-white outline-none text-xs font-black transition-all appearance-none cursor-pointer"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 ml-1">Task Instructions</label>
                            <textarea 
                                className="w-full px-8 py-5 bg-gray-50 rounded-[1.5rem] border border-transparent focus:border-emerald-100 focus:bg-white outline-none min-h-[120px] text-xs font-medium leading-relaxed italic"
                                placeholder="Describe the objectives and requirements..."
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-950/40 ml-1">Reference Assets</label>
                            <input 
                                type="file"
                                className="w-full px-8 py-5 bg-gray-50 rounded-[1.5rem] border border-dashed border-emerald-100 outline-none text-xs text-gray-400 file:bg-emerald-600 file:border-none file:text-white file:px-4 file:py-1 file:rounded-lg file:mr-4 file:text-[9px] file:font-black file:uppercase file:cursor-pointer"
                                onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                            />
                        </div>
                        <button type="submit" className="w-full py-6 bg-emerald-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-950/20 active:scale-95 shadow-sm">
                           Broadcast Assignment
                        </button>
                    </form>
                </Modal>
            )}

            {/* SUBMISSIONS MODAL */}
            {isSubmissionsModalOpen && (
                <Modal 
                    isOpen={isSubmissionsModalOpen} 
                    onClose={() => setIsSubmissionsModalOpen(false)} 
                    title={`${selectedAssignment?.title} Registry`}
                    wide
                >
                    <div className="space-y-10 p-4 font-body">
                        {subsLoading ? <Spinner /> : submissions.length === 0 ? (
                            <div className="py-24 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-100 flex flex-col items-center justify-center space-y-4">
                                <Activity size={40} className="text-gray-100" />
                                <div className="space-y-1 text-[10px] font-black uppercase tracking-widest text-gray-300">Awaiting student telemetry.</div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {submissions.map(sub => (
                                    <div key={sub._id} className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-[1.5rem] bg-emerald-50 text-emerald-600 flex items-center justify-center font-black italic text-xl shadow-sm border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                    {sub.student?.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="text-xl font-black text-emerald-950 uppercase italic tracking-tight">{sub.student?.name}</h4>
                                                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Received: {new Date(sub.submittedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="number" 
                                                        placeholder="Marks"
                                                        className="w-24 px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:border-emerald-100 outline-none text-xs font-black tabular-nums transition-all"
                                                        defaultValue={sub.grade}
                                                        onBlur={(e) => handleGrade(sub.student?._id, e.target.value, "Evaluated by Department")}
                                                    />
                                                    <div className="flex-1 px-6 py-4 bg-gray-50 rounded-2xl border border-transparent text-[9px] font-black uppercase tracking-widest text-gray-300 italic">
                                                        {sub.grade ? 'Grade Appended' : 'Awaiting Grading'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-8 mt-8 border-t border-gray-50 flex items-center justify-between">
                                            {sub.file ? (
                                                <a 
                                                    href={`http://localhost:5005/${sub.file}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm group-hover:-translate-y-1"
                                                >
                                                   <Download size={14} /> Open Portfolio
                                                </a>
                                            ) : (
                                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-200">No Asset Attached</span>
                                            )}
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-100 flex items-center justify-center shadow-inner group-hover:text-emerald-500 transition-colors">
                                                <ShieldCheck size={20} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};

const ShieldCheck = ({size, className}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>;

export default TeacherAssignments;
