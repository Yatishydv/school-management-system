// frontend/src/pages/student/StudentAssignments.jsx

import React, { useEffect, useState } from "react";
import { 
  FileText, Download, Upload, CheckCircle, 
  Clock, Calendar, AlertCircle, Bookmark,
  ChevronRight, ArrowRight, BookOpen, Layers, Send,
  ShieldCheck, Activity
} from "lucide-react";
import studentService from "../../api/studentService";
import useAuthStore from "../../stores/authStore";
import { toast } from "react-toastify";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/shared/Modal";

const StudentAssignments = () => {
    const { token } = useAuthStore();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await studentService.getAssignments(token);
            setAssignments(res || []);
        } catch (err) {
            toast.error("Failed to sync assignment archive.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return toast.warning("No file selected for submission.");

        const formData = new FormData();
        formData.append("assignmentFile", file);

        setUploading(true);
        try {
            await studentService.submitAssignment(selectedAssignment._id, formData, token);
            toast.success("Assignment submitted successfully.");
            setIsSubmitModalOpen(false);
            setFile(null);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || "Internal server error during upload.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-20 flex items-center justify-center min-h-screen animate-pulse"><Spinner size="xl" /></div>;

    return (
        <div className="min-h-screen bg-gray-50/20 pb-40 relative overflow-hidden font-body">
            {/* Vertical Editorial Watermark */}
            <div className="fixed right-[-5%] top-1/2 -translate-y-1/2 rotate-90 pointer-events-none select-none z-0 hidden lg:block">
                <h1 className="text-[18vh] font-black text-transparent uppercase tracking-tighter leading-none opacity-20" 
                    style={{ WebkitTextStroke: '1px rgba(30, 58, 138, 0.15)' }}>
                    PORTFOLIO
                </h1>
            </div>

            <header className="px-8 md:px-14 pt-16 relative z-10 space-y-12 mb-20">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-px bg-blue-600"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Assignments Portal</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black text-blue-950 tracking-tighter uppercase italic leading-none">
                        Active <span className="text-gray-200">Vault.</span>
                    </h1>
                </div>
            </header>

            <div className="px-8 md:px-14 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {assignments.map(asm => (
                        <div key={asm._id} className="group bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col md:flex-row gap-10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-0 bg-blue-600 group-hover:h-full transition-all duration-500"></div>
                            
                            <div className="flex-1 space-y-8 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col space-y-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 italic">{asm.subject?.name}</span>
                                        <h3 className="text-3xl font-black text-blue-950 tracking-tighter uppercase italic group-hover:translate-x-2 transition-transform duration-500">{asm.title}</h3>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                                        asm.status === 'Graded' ? 'bg-green-50 text-green-600 border-green-100' :
                                        asm.status === 'Submitted' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        'bg-gray-50 text-gray-400 border-gray-100'
                                    }`}>
                                        {asm.status}
                                    </div>
                                </div>

                                <p className="text-[11px] font-medium text-gray-400 leading-relaxed max-w-md group-hover:text-gray-500 transition-colors">{asm.description || "No specific instructions provided for this task node."}</p>

                                <div className="grid grid-cols-2 gap-6 pt-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all shadow-sm">
                                            <Calendar size={20} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">Deadline</span>
                                            <span className="text-[11px] font-black text-blue-950 uppercase tabular-nums italic">{new Date(asm.dueDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    {asm.status === 'Graded' && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shadow-sm">
                                                <ShieldCheck size={20} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-green-600">Marks</span>
                                                <span className="text-[11px] font-black text-blue-950 uppercase tabular-nums italic font-mono">{asm.submissionDetails?.grade || 0}/100</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 justify-center relative z-10">
                                {asm.file && (
                                    <a 
                                        href={`http://localhost:5005/${asm.file}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-5 bg-gray-50 text-blue-950 rounded-[1.5rem] flex items-center justify-center gap-4 hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-gray-100 group/btn"
                                    >
                                        <Download size={22} className="group-hover/btn:-translate-y-1 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Resource</span>
                                    </a>
                                )}
                                {asm.status === 'Pending' ? (
                                    <button 
                                        onClick={() => { setSelectedAssignment(asm); setIsSubmitModalOpen(true); }}
                                        className="p-5 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center gap-4 hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20 active:scale-95"
                                    >
                                        <Upload size={22} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Submit</span>
                                    </button>
                                ) : (
                                    <div className="p-8 bg-white border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center text-gray-200">
                                        <CheckCircle size={32} />
                                        <span className="text-[9px] font-black uppercase mt-3 tracking-widest">Received</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {assignments.length === 0 && (
                        <div className="col-span-full py-40 bg-white rounded-[4rem] border border-dashed border-gray-100 flex flex-col items-center justify-center text-center gap-8 shadow-sm">
                            <Activity size={48} className="text-gray-100 animate-pulse" />
                            <div className="space-y-2">
                                <p className="text-sm font-black uppercase italic text-blue-950 tracking-tighter">Academic Rhythm Dormant</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">No active assignment nodes identified.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* SUBMIT MODAL */}
            {isSubmitModalOpen && (
                <Modal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} title="Submission Protocol">
                    <form onSubmit={handleSubmit} className="space-y-8 p-4 font-body">
                        <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100 space-y-4 shadow-inner">
                            <h4 className="text-lg font-black text-blue-950 uppercase italic tracking-tighter">Target: {selectedAssignment?.title}</h4>
                            <p className="text-[10px] font-medium text-blue-400 italic">Ensure your documentation adheres to the departmental standards.</p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-blue-950/40 ml-1">Archive Source (PDF/DOC)</label>
                            <label className="w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-blue-400 transition-all group/upload shadow-inner overflow-hidden">
                                <input 
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => setFile(e.target.files[0])}
                                />
                                {file ? (
                                    <div className="flex flex-col items-center gap-4 group-hover:scale-110 transition-transform">
                                        <FileText size={56} className="text-blue-600" />
                                        <div className="text-center">
                                            <span className="text-xs font-black text-blue-950 truncate max-w-[240px] block">{file.name}</span>
                                            <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Ready for deployment</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="w-20 h-20 rounded-[2rem] bg-white shadow-xl shadow-blue-900/5 flex items-center justify-center text-gray-200 group-hover:text-blue-600 group-hover:rotate-12 transition-all">
                                            <Upload size={36} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic">Attach Performance Asset</span>
                                    </div>
                                )}
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={uploading || !file}
                            className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center gap-4 active:scale-95"
                        >
                            {uploading ? <Spinner size="sm" /> : <><Send size={22}/> Push Submission</>}
                        </button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default StudentAssignments;
