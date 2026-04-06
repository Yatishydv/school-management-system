// frontend/src/pages/teacher/TeacherClasses.jsx

import React, { useEffect, useState } from "react";
import { 
  Users, Search, ChevronRight, GraduationCap, 
  BookOpen, Activity, User, Mail, Phone, Fingerprint,
  Layers, ShieldCheck, MapPin, Star, MoreVertical,
  ExternalLink,
  ClipboardList
} from "lucide-react";
import teacherService from "../../api/teacherService";
import useAuthStore from "../../stores/authStore";
import { toast } from "react-toastify";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/shared/Modal";

const TeacherClasses = () => {
    const { token } = useAuthStore();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [studLoading, setStudLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await teacherService.getAssignedClasses(token);
            setClasses(res || []);
        } catch (err) {
            toast.error("Failed to retrieve structural nodes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const handleViewClass = async (cls) => {
        setSelectedClass(cls);
        setStudLoading(true);
        try {
            const res = await teacherService.getClassStudents(cls._id, token);
            setStudents(res || []);
        } catch (err) {
            toast.error("Failed to fetch scholar registry.");
        } finally {
            setStudLoading(false);
        }
    };

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.uniqueId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-20 flex items-center justify-center min-h-screen animate-pulse bg-emerald-50/20"><Spinner size="xl" /></div>;

    return (
        <div className="min-h-screen bg-emerald-50/20 pb-40 relative overflow-hidden font-body">
            <header className="px-8 md:px-14 pt-16 relative z-10 space-y-12 mb-20">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-px bg-emerald-600"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-600">Institutional Jurisdictions</span>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                        <div className="space-y-2">
                             <h1 className="text-4xl md:text-7xl font-black text-emerald-950 tracking-tighter uppercase italic leading-none">
                                Faculty <span className="text-white">Nodes.</span>
                            </h1>
                            <p className="text-[10px] font-bold text-emerald-950/40 uppercase tracking-[0.3em] ml-1">
                                Command center for class management and scholar rosters.
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="px-8 md:px-14 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {classes.map(cls => (
                        <div 
                            key={cls._id} 
                            onClick={() => handleViewClass(cls)}
                            className="group bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col justify-between min-h-[320px] relative overflow-hidden"
                        >
                            {/* Suble Accent Gradient */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -translate-y-16 translate-x-16 opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
                            
                            <div className="space-y-8 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                        <Layers size={24} />
                                    </div>
                                    <div className="flex flex-col items-end gap-1 text-right">
                                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-300">Operational</span>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-100 group-hover:bg-white group-hover:border-transparent transition-all">
                                            {cls.stream || "General"}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-2xl md:text-3xl font-black text-emerald-950 leading-tight uppercase italic group-hover:translate-x-1 transition-transform tracking-tight break-words pr-4">{cls.name}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="bg-gray-50 px-3 py-1.5 rounded-lg text-[8.5px] font-black uppercase tracking-widest text-gray-400 group-hover:bg-white transition-colors border border-gray-100">
                                            {cls.sections?.length || 0} SECTIONS
                                        </div>
                                        <div className="bg-emerald-50/50 text-emerald-700 px-3 py-1.5 rounded-lg text-[8.5px] font-black uppercase tracking-widest group-hover:bg-emerald-600 group-hover:text-white transition-colors border border-emerald-100 group-hover:border-transparent">
                                            Active Hub
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 mt-6 border-t border-gray-50 relative z-10 w-full">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-300">Registry</span>
                                    <span className="text-lg font-black text-emerald-600 tabular-nums italic">View Scholars</span>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gray-50 text-emerald-950 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm hover:rotate-6">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* CLASS DETAILS MODAL */}
            {selectedClass && (
                <Modal 
                    isOpen={!!selectedClass} 
                    onClose={() => setSelectedClass(null)} 
                    title={`${selectedClass.name} Scholar Registry`}
                    wide
                >
                    <div className="space-y-12 p-6 font-body">
                        <header className="flex flex-col md:flex-row justify-between items-center gap-8">
                            <div className="relative group w-full md:w-96">
                                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                <input 
                                    type="text"
                                    placeholder="Search Institutional Database..."
                                    className="w-full pl-16 pr-8 py-5 bg-gray-50 rounded-2xl border border-transparent focus:border-emerald-100 focus:bg-white outline-none transition-all font-black text-[10px] tracking-widest uppercase italic"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="px-6 py-4 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                                    <Users size={16} /> {filteredStudents.length} Records Found
                                </div>
                            </div>
                        </header>

                        {studLoading ? (
                           <div className="py-24 flex justify-center"><Spinner size="xl" /></div>
                        ) : filteredStudents.length === 0 ? (
                           <div className="py-32 text-center bg-gray-50 rounded-[4rem] border border-dashed border-gray-100 flex flex-col items-center justify-center space-y-6">
                              <Search size={48} className="text-gray-100" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic">No matching scholar nodes identified in this jurisdiction.</p>
                           </div>
                        ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredStudents.map(student => (
                                        <div 
                                            key={student._id} 
                                            onClick={() => setSelectedStudent(student)}
                                            className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-5 relative overflow-hidden cursor-pointer"
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                               <GraduationCap size={60} className="text-emerald-100" />
                                            </div>
                                            
                                            <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform duration-500 border border-emerald-50">
                                                {student.profileImage ? (
                                                    <img src={`http://localhost:5005/${student.profileImage}`} className="w-full h-full object-cover" alt={student.name} />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-emerald-200 font-black text-2xl uppercase italic bg-gray-50">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 space-y-3 relative z-10 min-w-0">
                                                <h4 className="text-lg font-black text-emerald-950 uppercase italic leading-tight truncate tracking-tight">{student.name}</h4>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg border border-gray-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                        <Fingerprint size={10} className="text-emerald-600 group-hover:text-white" />
                                                        <span className="text-[8px] font-black uppercase italic tabular-nums">{student.uniqueId}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-50 group-hover:bg-white group-hover:border-transparent transition-all">
                                                        <ClipboardList size={10} />
                                                        <span className="text-[8px] font-black uppercase italic tabular-nums">Roll: {student.rollNumber || '—'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="p-3 bg-gray-50 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                                               <ChevronRight size={18} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                        )}
                    </div>
                </Modal>
            )}
            {/* STUDENT DETAIL MODAL */}
            {selectedStudent && (
                <Modal 
                    isOpen={!!selectedStudent} 
                    onClose={() => setSelectedStudent(null)} 
                    title="Scholar Registry Entry"
                    size="2xl"
                >
                    <div className="p-10 space-y-12 font-body relative overflow-hidden">
                        {/* Subtle Logo Watermark */}
                        <div className="absolute top-0 right-0 p-12 opacity-[0.02]">
                            <GraduationCap size={220} />
                        </div>

                        <div className="flex flex-col md:flex-row gap-12 items-center md:items-start relative z-10">
                            <div className="w-40 h-40 rounded-[3rem] bg-emerald-50 border-4 border-white shadow-2xl overflow-hidden shrink-0">
                                {selectedStudent.profileImage ? (
                                    <img src={`http://localhost:5005/${selectedStudent.profileImage}`} className="w-full h-full object-cover" alt={selectedStudent.name} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-emerald-600 font-black text-6xl italic bg-emerald-50">
                                        {selectedStudent.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex-1 space-y-10">
                                <div className="space-y-4 text-center md:text-left">
                                    <h3 className="text-4xl font-black text-emerald-950 uppercase italic tracking-tighter leading-none">{selectedStudent.name}</h3>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-950 text-white rounded-full">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Roll: {selectedStudent.rollNumber || "—"}</span>
                                        </div>
                                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">UID: {selectedStudent.uniqueId || "—"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/20">Father's Name</span>
                                                <span className="text-base font-black text-emerald-950 uppercase italic">{selectedStudent.fatherName || "—"}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/20">Mother's Name</span>
                                                <span className="text-base font-black text-emerald-950 uppercase italic">{selectedStudent.motherName || "—"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/20">Contact Number</span>
                                                <span className="text-base font-black text-emerald-950 tabular-nums">{selectedStudent.phone || "—"}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/20">Email Address</span>
                                                <span className="text-base font-black text-emerald-950 lowercase">{selectedStudent.email || "—"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="pt-8 border-t border-gray-50 flex flex-col">
                                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-950/20 mb-3">Residential Address</span>
                                    <p className="text-sm font-medium text-emerald-950/70 italic leading-relaxed">
                                        {selectedStudent.address || "No address provided in archive."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

const ArrowRight = ({size, className}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;

export default TeacherClasses;
