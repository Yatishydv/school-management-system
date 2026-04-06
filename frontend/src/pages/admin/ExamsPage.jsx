import React, { useEffect, useState } from "react";
import { Plus, Calendar, Clock, Trash2, BookOpen, Shield, Search, Layout, Filter, CheckCircle, CheckSquare, XSquare } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import adminService from "../../api/adminService";
import { toast } from "react-toastify";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/shared/Modal";
import ConfirmModal from "../../components/shared/ConfirmModal";

const ExamsPage = () => {
  const { token } = useAuthStore();
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [deletingBulk, setDeletingBulk] = useState(false);
  const [deleteBulkTarget, setDeleteBulkTarget] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    classId: "",
    subjectId: "",
    teacherId: "",
    date: "",
    startTime: "09:00",
    endTime: "12:00",
    totalMarks: 100,
    passingMarks: 33,
    room: ""
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [examRes, classRes, subjRes] = await Promise.all([
        adminService.getExams(token),
        adminService.getClasses(token),
        adminService.getSubjects(token)
      ]);
      setExams(examRes || []);
      setClasses(classRes || []);
      setSubjects(subjRes || []);
    } catch (err) {
      toast.error("Failed to sync examination matrix.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminService.createExam(formData, token);
      toast.success("Examination scheduled successfully.");
      setIsModalOpen(false);
      setFormData({
        title: "", classId: "", subjectId: "", teacherId: "", date: "",
        startTime: "09:00", endTime: "12:00", totalMarks: 100, passingMarks: 33, room: ""
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule exam.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteExam(deleteTarget, token);
      toast.success("Examination event cancelled.");
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error("Cancellation failed.");
    }
  };

  const handleBulkDelete = async () => {
    setDeletingBulk(true);
    try {
      for (const id of selectedIds) {
          await adminService.deleteExam(id, token);
      }
      toast.success(`${selectedIds.length} Examination events cancelled.`);
      fetchData();
      setSelectedIds([]);
      setIsSelectMode(false);
    } catch (err) {
      toast.error("Process partially failed. Some exams may not have been deleted.");
      fetchData();
    } finally {
      setDeletingBulk(false);
      setDeleteBulkTarget(false);
    }
  };

  useEffect(() => {
     setSelectedIds([]);
     setIsSelectMode(false);
  }, [searchTerm]);

  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.classId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.subjectId?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 space-y-12 pb-24 relative overflow-hidden">
      {/* Watermark */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-[15vw] font-black text-gray-100/50 pointer-events-none select-none tracking-tighter uppercase whitespace-nowrap">
        RESOURCES
      </div>

      <header className="px-8 md:px-14 pt-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-red-500"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Assessment Protocol</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none text-primary-950 uppercase italic">
              Exam <span className="text-gray-200">Hub.</span>
            </h1>
         </div>
         
         <div className="flex gap-3">
             {isSelectMode ? (
                <>
                  {selectedIds.length > 0 && (
                      <button
                        onClick={() => setDeleteBulkTarget(true)}
                        className="px-5 py-4 rounded-2xl bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all flex items-center gap-3 group shadow-sm mr-2 animate-fade-up"
                      >
                        <Trash2 size={18} className="group-hover:-translate-y-1 transition-transform" />
                        <span className="text-xs font-bold uppercase tracking-wider hidden md:block">Delete ({selectedIds.length})</span>
                      </button>
                  )}
                  <button
                    onClick={() => { setIsSelectMode(false); setSelectedIds([]); }}
                    className="px-5 py-4 rounded-2xl bg-white text-gray-500 border border-gray-100 hover:bg-gray-100 transition-all flex items-center gap-3 group shadow-sm mr-2 animate-fade-up"
                  >
                    <XSquare size={18} className="group-hover:-translate-y-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-wider hidden md:block">Cancel</span>
                  </button>
                </>
             ) : (
                <button
                  onClick={() => setIsSelectMode(true)}
                  className="px-5 py-4 rounded-2xl bg-white text-primary-950 border border-gray-100 hover:border-red-500 hover:text-red-500 transition-all flex items-center gap-3 group shadow-sm mr-2"
                >
                  <CheckSquare size={18} className="group-hover:-translate-y-1 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-wider hidden md:block">Select</span>
                </button>
             )}

             <button 
               onClick={() => setIsModalOpen(true)}
               className="px-8 py-5 rounded-2xl bg-primary-950 text-white hover:bg-red-600 transition-all flex items-center gap-4 group shadow-xl shadow-primary-950/20"
             >
                <span className="text-xs font-black uppercase tracking-widest hidden md:block">Schedule</span>
                <Plus size={20} className="group-hover:rotate-180 transition-transform duration-500" />
             </button>
         </div>
      </header>

      <div className="px-8 md:px-14 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 mb-12">
            {isSelectMode && (
                <div className="flex items-center justify-center pl-6 pr-4 py-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <input 
                       type="checkbox" 
                       className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500 cursor-pointer"
                       checked={filteredExams.length > 0 && selectedIds.length === filteredExams.length}
                       onChange={(e) => setSelectedIds(e.target.checked ? filteredExams.map(ex => ex._id) : [])}
                    />
                </div>
            )}
            <div className="flex-1 relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-red-500 transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Search Assessment Nodes..."
                    className="w-full pl-16 pr-8 py-5 bg-white rounded-2xl border border-gray-100 shadow-sm outline-none focus:ring-4 focus:ring-red-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="px-6 py-5 bg-white rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-primary-950 flex items-center gap-3 shadow-sm">
                <Filter size={16} className="text-red-500" />
                Scheduled Tasks: {filteredExams.length}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExams.map((exam) => (
                <div 
                  key={exam._id} 
                  className={`group relative rounded-[2.5rem] p-8 border hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden ${isSelectMode ? 'cursor-pointer' : ''} ${selectedIds.includes(exam._id) ? 'bg-red-50/50 border-red-200 shadow-md' : 'bg-white border-gray-100 shadow-sm'}`}
                  onClick={isSelectMode ? () => setSelectedIds(prev => prev.includes(exam._id) ? prev.filter(id => id !== exam._id) : [...prev, exam._id]) : undefined}
                >
                    {/* Floating Checkbox */}
                    {isSelectMode && (
                        <div className="absolute top-8 left-8 z-10" onClick={e => e.stopPropagation()}>
                           <input 
                               type="checkbox" 
                               className="w-5 h-5 rounded border-gray-300 text-red-500 focus:ring-red-500 cursor-pointer shadow-sm"
                               checked={selectedIds.includes(exam._id)}
                               onChange={() => setSelectedIds(prev => prev.includes(exam._id) ? prev.filter(id => id !== exam._id) : [...prev, exam._id])}
                           />
                        </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-8 right-8">
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100 text-[8px] font-black uppercase tracking-widest">
                           {exam.status}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-primary-950 group-hover:bg-red-500 group-hover:text-white transition-all duration-500">
                            <Shield size={24} />
                        </div>

                        <div>
                            <h3 className="text-2xl font-black text-primary-950 tracking-tighter uppercase italic leading-tight">{exam.title}</h3>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{exam.subjectId?.name}</span>
                                <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                                <span className="text-[10px] font-black text-primary-950 uppercase tracking-widest italic">{exam.teacherId?.name || "Unassigned"}</span>
                                <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{exam.classId ? `${exam.classId.name}${exam.classId.stream !== 'General' ? ` (${exam.classId.stream})` : ''}` : "N/A"}</span>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-50 grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">Chronicle</p>
                                <div className="flex items-center gap-2 text-[10px] font-black text-primary-950 uppercase">
                                    <Calendar size={12} className="text-red-500" />
                                    {new Date(exam.date).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">Temporal</p>
                                <div className="flex items-center justify-end gap-2 text-[10px] font-black text-primary-950 uppercase">
                                    <Clock size={12} className="text-red-500" />
                                    {exam.startTime} - {exam.endTime}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center bg-gray-50 rounded-2xl p-4">
                            <div className="space-y-0.5">
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Total Threshold</p>
                                <p className="text-sm font-black text-primary-950 tabular-nums">{exam.totalMarks} pts</p>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setDeleteTarget(exam._id); }}
                                className="p-3 text-gray-300 hover:text-red-500 hover:bg-white rounded-xl transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            
            {filteredExams.length === 0 && (
                <div className="col-span-full py-40 bg-white rounded-[4rem] border border-dashed border-gray-100 flex flex-col items-center justify-center text-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-200">
                        <Shield size={40} />
                    </div>
                    <p className="text-xs font-black uppercase text-gray-300 tracking-[0.4em]">Registry Empty</p>
                    <button onClick={() => setIsModalOpen(true)} className="px-8 py-4 bg-primary-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Initialize Assessment</button>
                </div>
            )}
        </div>
      </div>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Assessment">
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Examination Title</label>
                    <input 
                      required
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-gray-100 outline-none transition-all"
                      placeholder="e.g. Mid-Term Evaluation"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Target Node (Class)</label>
                        <select 
                          required
                          className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none"
                          value={formData.classId}
                          onChange={e => setFormData({...formData, classId: e.target.value})}
                        >
                           <option value="">Select Class</option>
                           {classes.map(c => <option key={c._id} value={c._id}>{c.name}{c.stream !== 'General' ? ` (${c.stream})` : ''}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Curricular Unit</label>
                        <select 
                          required
                          className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none"
                          value={formData.subjectId}
                          onChange={e => setFormData({...formData, subjectId: e.target.value, teacherId: ""})}
                        >
                           <option value="">Select Subject</option>
                           {subjects.filter(s => !formData.classId || s.classId?._id === formData.classId || s.classId === formData.classId).map(s => (
                             <option key={s._id} value={s._id}>{s.name}</option>
                           ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Faculty Lead (From Subject Assignment)</label>
                    <select 
                      required
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none disabled:opacity-50"
                      value={formData.teacherId}
                      onChange={e => setFormData({...formData, teacherId: e.target.value})}
                      disabled={!formData.subjectId}
                    >
                       <option value="">Select Teacher</option>
                       {subjects.find(s => s._id === formData.subjectId)?.assignedTeachers?.map(t => (
                         <option key={t._id} value={t._id}>{t.name}</option>
                       ))}
                    </select>
                </div>

                <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Chronicle (Date)</label>
                        <input 
                          type="date"
                          required
                          className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none"
                          value={formData.date}
                          onChange={e => setFormData({...formData, date: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Start Axis</label>
                        <input 
                          type="time"
                          required
                          className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none"
                          value={formData.startTime}
                          onChange={e => setFormData({...formData, startTime: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">End Axis</label>
                        <input 
                          type="time"
                          required
                          className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none"
                          value={formData.endTime}
                          onChange={e => setFormData({...formData, endTime: e.target.value})}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Threshold (Total)</label>
                        <input 
                          type="number"
                          required
                          className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none"
                          value={formData.totalMarks}
                          onChange={e => setFormData({...formData, totalMarks: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Pass Logic</label>
                        <input 
                          type="number"
                          required
                          className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none"
                          value={formData.passingMarks}
                          onChange={e => setFormData({...formData, passingMarks: e.target.value})}
                        />
                    </div>
                </div>

                <div className="pt-6 flex gap-6">
                  <button type="submit" className="flex-1 py-5 bg-primary-950 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 transition-all">Establish Event</button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 py-5 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-widest">Abort</button>
                </div>
            </form>
        </Modal>
      )}

      <ConfirmModal 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Cancel Examination?"
        message="This will permanently nullify this assessment event. Proceed with cancellation?"
        confirmText="Cancel Exam"
      />

      <ConfirmModal 
        isOpen={deleteBulkTarget}
        onClose={() => setDeleteBulkTarget(false)}
        onConfirm={handleBulkDelete}
        title={`Cancel ${selectedIds.length} Examinations?`}
        message="This will permanently nullify the selected assessment events. Proceed with cancellation?"
        confirmText={deletingBulk ? "Cancelling..." : "Cancel Selected Exams"}
      />
    </div>
  );
};

export default ExamsPage;
