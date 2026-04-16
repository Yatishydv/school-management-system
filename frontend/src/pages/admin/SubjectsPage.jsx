import React, { useEffect, useState } from "react";
import { Plus, Book, Trash2, User, Search, Layout, Filter, Shield, Edit2, Download, Upload, CheckSquare, XSquare } from "lucide-react";
import * as xlsx from "xlsx";
import { saveAs } from 'file-saver';
import { exportToExcel } from "../../utils/excelExport";
import useAuthStore from "../../stores/authStore";
import adminService from "../../api/adminService";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/shared/ConfirmModal";
import BulkImportModal from "../../components/admin/BulkImportModal";
import Modal from "../../components/shared/Modal";

const SubjectsPage = () => {
  const { token } = useAuthStore();
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [deletingBulk, setDeletingBulk] = useState(false);
  const [deleteBulkTarget, setDeleteBulkTarget] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  
  const subjectTemplate = [
    {
        "Subject Name*": "Physics",
        "Subject Code*": "PHY-101",
        "Class": "Class 10",
        "Teachers (Comma Separated IDs/Names)": "TEC0001, Jane Smith"
    }
  ];

  const handleBulkUpload = async (jsonData) => {
      const payload = jsonData.map(row => ({
          name: row["Subject Name*"],
          code: row["Subject Code*"],
          Class: row["Class"],
          Teachers: row["Teachers (Comma Separated IDs/Names)"]
      })).filter(s => s.name && s.code);

      if (payload.length === 0) {
          toast.error("No valid subjects found in the file. Make sure Subject Name and Code are present.");
          return false;
      }

      const response = await adminService.bulkAddSubjects({ subjects: payload }, token);
      
      if (response.results.failed > 0) {
          toast.warning(`Imported ${response.results.successful} records. Failed: ${response.results.failed}. check console for details.`);
          console.error("Bulk Import Errors:", response.results.errors);
          return true; 
      } else {
          toast.success("All subjects imported successfully!");
          return true;
      }
  };

  const handleExport = () => {
    if (subjects.length === 0) {
      toast.warning("No data to export");
      return;
    }
    const exportData = subjects.map(s => ({
        "Name": s.name,
        "Code": s.code,
        "Class": s.classId ? `${s.classId.name}${s.classId.stream !== 'General' ? ` (${s.classId.stream})` : ''}` : "Universal",
        "Assigned Teachers": s.assignedTeachers?.map(t => t.name).join(', ') || ''
    }));
    exportToExcel(exportData, "Subjects", "Subjects_Export.xlsx");
  };

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    classId: "",
    assignedTeacherIds: []
  });
  const [editingSubjectId, setEditingSubjectId] = useState(null);

  const openAddModal = () => {
      setEditingSubjectId(null);
      setFormData({ name: "", code: "", classId: "", assignedTeacherIds: [] });
      setIsModalOpen(true);
  };

  const openEditModal = (subject) => {
      setEditingSubjectId(subject._id);
      setFormData({
          name: subject.name,
          code: subject.code,
          classId: subject.classId?._id || "",
          assignedTeacherIds: subject.assignedTeachers?.map(t => t._id) || []
      });
      setIsModalOpen(true);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [subjRes, classRes, userRes] = await Promise.all([
        adminService.getSubjects(token),
        adminService.getClasses(token),
        adminService.getUsers("teacher", token)
      ]);
      setSubjects(subjRes || []);
      setClasses(classRes || []);
      setTeachers(userRes || []);
    } catch (err) {
       console.error(err);
      toast.error("Failed to sync structural vaults.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubjectId) {
          await adminService.updateSubject(editingSubjectId, formData, token);
          toast.success("Structural asset updated.");
      } else {
          await adminService.addSubject(formData, token);
          toast.success("Structural asset added to vault.");
      }
      setIsModalOpen(false);
      setFormData({ name: "", code: "", classId: "", assignedTeacherIds: [] });
      setEditingSubjectId(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process subject.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteSubject(deleteTarget, token);
      toast.success("Asset decommissioned successfully.");
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      toast.error("Process termination failed.");
    }
  };

  const handleBulkDelete = async () => {
    setDeletingBulk(true);
    try {
      for (const id of selectedIds) {
          await adminService.deleteSubject(id, token);
      }
      toast.success(`${selectedIds.length} Assets Decommissioned.`);
      fetchData();
      setSelectedIds([]);
      setIsSelectMode(false);
    } catch (err) {
      toast.error("Process partially failed. Some subjects may not have been deleted.");
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

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code?.toLowerCase().includes(searchTerm.toLowerCase())
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
               <div className="w-2 h-2 rounded-full bg-accent-500"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Institutional Catalog</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none text-primary-950">
              Subject <span className="text-gray-200">Vault.</span>
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
                  className="px-5 py-4 rounded-2xl bg-white text-primary-950 border border-gray-100 hover:border-accent-500 hover:text-accent-500 transition-all flex items-center gap-3 group shadow-sm mr-2"
                >
                  <CheckSquare size={18} className="group-hover:-translate-y-1 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-wider hidden md:block">Select</span>
                </button>
             )}
             
             <button
               onClick={handleExport}
               className="px-5 py-4 rounded-2xl bg-white text-primary-950 border border-gray-100 hover:border-blue-500 hover:text-blue-500 transition-all flex items-center gap-3 group shadow-sm"
             >
                <Download size={18} className="group-hover:-translate-y-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider hidden md:block">Export</span>
             </button>
             
             <button
               onClick={() => setShowBulkModal(true)}
               className="px-5 py-4 rounded-2xl bg-white text-primary-950 border border-gray-100 hover:border-accent-500 hover:text-accent-500 transition-all flex items-center gap-3 group shadow-sm"
             >
                <Upload size={18} className="group-hover:-translate-y-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-wider hidden md:block">Import</span>
             </button>

             <button 
               onClick={openAddModal}
               className="px-6 py-4 rounded-2xl bg-primary-950 text-white hover:bg-accent-500 transition-all flex items-center gap-3 group shadow-xl shadow-primary-950/20"
             >
                <span className="text-xs font-black uppercase tracking-widest hidden md:block">Catalog Subject</span>
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
                       className="w-4 h-4 rounded border-gray-300 text-accent-500 focus:ring-accent-500 cursor-pointer"
                       checked={filteredSubjects.length > 0 && selectedIds.length === filteredSubjects.length}
                       onChange={(e) => setSelectedIds(e.target.checked ? filteredSubjects.map(s => s._id) : [])}
                    />
                </div>
            )}
            <div className="flex-1 relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent-500 transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Search Curricular Nodes..."
                    className="w-full pl-16 pr-8 py-5 bg-white rounded-2xl border border-gray-100 shadow-sm outline-none focus:ring-4 focus:ring-accent-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="px-6 py-5 bg-white rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-primary-950 flex items-center gap-3 shadow-sm">
                <Filter size={16} className="text-accent-500" />
                Active Assets: {filteredSubjects.length}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredSubjects.map((subject) => (
                <div 
                   key={subject._id} 
                   className={`group relative rounded-3xl p-8 border hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${isSelectMode ? 'cursor-pointer' : ''} ${selectedIds.includes(subject._id) ? 'bg-accent-50 border-accent-200 shadow-md' : 'bg-white border-gray-100 shadow-sm'}`}
                   onClick={isSelectMode ? () => setSelectedIds(prev => prev.includes(subject._id) ? prev.filter(id => id !== subject._id) : [...prev, subject._id]) : undefined}
                >
                    {/* Floating Checkbox */}
                    {isSelectMode && (
                        <div className="absolute top-6 right-6 z-10" onClick={e => e.stopPropagation()}>
                           <input 
                               type="checkbox" 
                               className="w-5 h-5 rounded border-gray-300 text-accent-500 focus:ring-accent-500 cursor-pointer shadow-sm"
                               checked={selectedIds.includes(subject._id)}
                               onChange={() => setSelectedIds(prev => prev.includes(subject._id) ? prev.filter(id => id !== subject._id) : [...prev, subject._id])}
                           />
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="p-4 bg-gray-50 rounded-2xl text-primary-950 group-hover:bg-accent-500 group-hover:text-white transition-all duration-500">
                                <Book size={24} />
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => openEditModal(subject)}
                                    className="p-2 text-gray-300 hover:text-primary-950 transition-colors"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button 
                                    onClick={() => setDeleteTarget(subject._id)}
                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-primary-950 tracking-tighter leading-tight uppercase italic">{subject.name}</h3>
                            <div className="text-[9px] font-black text-accent-500 uppercase tracking-widest">{subject.code}</div>
                        </div>

                        <div className="pt-4 border-t border-gray-50 space-y-4">
                            <div className="flex items-center gap-2">
                                <Layout size={14} className="text-gray-300" />
                                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                                    {subject.classId ? `${subject.classId.name}${subject.classId.stream !== 'General' ? ` (${subject.classId.stream})` : ''}` : "Universal"}
                                </span>
                            </div>
                            <div className="flex items-start gap-2">
                                <User size={14} className="text-gray-300 mt-1" />
                                <span className="text-[9px] font-black uppercase text-primary-950 tracking-widest leading-relaxed">
                                    {subject.assignedTeachers?.length > 0 
                                      ? subject.assignedTeachers.map(t => t.name).join(', ') 
                                      : "Unassigned"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Modal Placeholder */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-primary-950/20 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
           <div className="bg-white w-full max-w-lg rounded-3xl p-10 shadow-2xl relative z-10 border border-gray-100 animate-fade-up">
              <h2 className="text-3xl font-black text-primary-950 tracking-tighter uppercase italic mb-8">{editingSubjectId ? "Update Definition" : "Subject Definition"}</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Academic Name</label>
                    <input 
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-accent-50"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      placeholder="e.g. Quantum Physics"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Asset Code</label>
                    <input 
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-4 focus:ring-accent-50"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      placeholder="e.g. PHY-Q1"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Target Node (Class)</label>
                       <select 
                         className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none"
                         value={formData.classId}
                         onChange={(e) => setFormData({...formData, classId: e.target.value})}
                         required
                       >
                          <option value="">Select Class</option>
                          {classes.map(c => <option key={c._id} value={c._id}>{c.name}{c.stream !== 'General' ? ` (${c.stream})` : ''}</option>)}
                       </select>
                    </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Faculty Assignment</label>
                     <select 
                         className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none"
                         value={formData.assignedTeacherIds[0] || ""}
                         onChange={(e) => setFormData({...formData, assignedTeacherIds: e.target.value ? [e.target.value] : []})}
                     >
                         <option value="">Select Faculty</option>
                         {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                     </select>
                  </div>
                 </div>
                 <div className="pt-4 flex gap-4">
                    <button type="submit" className="flex-1 py-5 bg-primary-950 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-accent-500 transition-all">Synchronize</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-5 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-widest">Cancel</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {showBulkModal && (
        <Modal 
          isOpen={showBulkModal} 
          onClose={() => setShowBulkModal(false)} 
          title="Bulk Import Subjects"
          size="2xl"
        >
          <BulkImportModal 
              onClose={() => setShowBulkModal(false)} 
              onSuccess={fetchData} 
              templateData={subjectTemplate}
              templateName="Subjects Template"
              expectedFileName="Subject_Bulk_Import.xlsx"
              onUpload={handleBulkUpload}
          />
        </Modal>
      )}

      <ConfirmModal 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Decommission Asset?"
        message="This action will permanently remove this curricular logic block from the system."
        confirmText="Decommission"
      />

      <ConfirmModal 
        isOpen={deleteBulkTarget}
        onClose={() => setDeleteBulkTarget(false)}
        onConfirm={handleBulkDelete}
        title={`Decommission ${selectedIds.length} Assets?`}
        message="This action will permanently remove the selected curricular logic blocks from the system. Proceed?"
        confirmText={deletingBulk ? "Decommissioning..." : "Decommission Selected"}
      />
    </div>
  );
};

export default SubjectsPage;
