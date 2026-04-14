import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  Users,
  Search,
  Layout,
  UserPlus,
  Activity,
  Download,
  Upload,
  CheckSquare,
  XSquare
} from "lucide-react";
import * as xlsx from "xlsx";
import useAuthStore from "../../stores/authStore";
import adminService from "../../api/adminService";
import { toast } from "react-toastify";
import AddEditUserModal from "../../components/admin/AddEditUserModal";
import BulkImportModal from "../../components/admin/BulkImportModal";
import Modal from "../../components/shared/Modal";
import ConfirmModal from "../../components/shared/ConfirmModal";

const ClassesPage = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    stream: "General",
    sections: "",
    classTeacherId: ""
  });

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [targetClassForStudent, setTargetClassForStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [deletingBulk, setDeletingBulk] = useState(false);
  const [deleteBulkTarget, setDeleteBulkTarget] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const classTemplate = [
    {
        "Name*": "Class 10",
        "Stream": "General",
        "Sections (Comma Separated)": "A, B, C",
        "Class Teacher (ID/Name)": "TEC0001"
    }
  ];

  const handleBulkUpload = async (jsonData) => {
      const payload = jsonData.map(row => ({
          name: row["Name*"],
          stream: row["Stream"],
          sections: row["Sections (Comma Separated)"],
          classTeacher: row["Class Teacher (ID/Name)"]
      })).filter(c => c.name);

      if (payload.length === 0) {
          toast.error("No valid class names found in the file.");
          return false;
      }

      const response = await adminService.bulkAddClasses({ classes: payload }, token);
      
      if (response.results.failed > 0) {
          toast.warning(`Imported ${response.results.successful} records. Failed: ${response.results.failed}. check console for details.`);
          console.error("Bulk Import Errors:", response.results.errors);
          return true; 
      } else {
          toast.success("All classes imported successfully!");
          return true;
      }
  };

  const handleExport = () => {
    if (classes.length === 0) {
      toast.warning("No data to export");
      return;
    }
    const exportData = classes.map(c => ({
        "Name": c.name,
        "Stream": c.stream || 'General',
        "Sections": c.sections?.join(', ') || '',
        "Class Teacher": c.classTeacher?.name || 'Unassigned'
    }));
    const ws = xlsx.utils.json_to_sheet(exportData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Classes");
    xlsx.writeFile(wb, "Classes_Export.xlsx");
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classRes, userRes] = await Promise.all([
        adminService.getClasses(token),
        adminService.getUsers("teacher", token)
      ]);
      setClasses(classRes || []);
      setTeachers(userRes || []);
    } catch (err) {
      toast.error("Failed to sync structural hub.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const sectionsArray = formData.sections.trim() !== "" 
        ? formData.sections.split(',').map(s => s.trim().toUpperCase()).filter(s => s !== "")
        : [];
      await adminService.createClass({ ...formData, sections: sectionsArray }, token);
      toast.success("Structural asset created.");
      setIsModalOpen(false);
      setFormData({ name: "", stream: "General", sections: "", classTeacherId: "" });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to structure node.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteClass(deleteTarget, token);
      toast.success("Structural asset decommissioned.");
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
          await adminService.deleteClass(id, token);
      }
      toast.success(`${selectedIds.length} Assets Decommissioned.`);
      fetchData();
      setSelectedIds([]);
      setIsSelectMode(false);
    } catch (err) {
      toast.error("Process partially failed. Some classes may not have been deleted.");
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

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 space-y-12 pb-24 relative overflow-hidden">
      {/* Watermark */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-[20vw] font-black text-gray-100/50 pointer-events-none select-none tracking-tighter uppercase whitespace-nowrap">
        ACADEMIC
      </div>

      <header className="px-8 md:px-14 pt-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-accent-500"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Institutional Infrastructure</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none text-primary-950">
              Academic <span className="text-gray-200">Hub.</span>
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
               onClick={() => setIsModalOpen(true)}
               className="px-6 py-4 rounded-2xl bg-primary-950 text-white hover:bg-accent-500 transition-all flex items-center gap-3 group shadow-xl shadow-primary-950/20"
             >
                <span className="text-xs font-black uppercase tracking-widest hidden md:block">Structure Class</span>
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
                       checked={filteredClasses.length > 0 && selectedIds.length === filteredClasses.length}
                       onChange={(e) => setSelectedIds(e.target.checked ? filteredClasses.map(c => c._id) : [])}
                    />
                </div>
            )}
            <div className="flex-1 relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent-500 transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Search Structural Assets..."
                    className="w-full pl-16 pr-8 py-5 bg-white rounded-2xl border border-gray-100 shadow-sm outline-none focus:ring-4 focus:ring-accent-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="px-6 py-5 bg-white rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-primary-950 flex items-center gap-3 shadow-sm">
                <Layout size={16} className="text-accent-500" />
                Active Assets: {filteredClasses.length}
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredClasses.map((c) => (
                <div 
                  key={c._id} 
                  onClick={() => isSelectMode ? setSelectedIds(prev => prev.includes(c._id) ? prev.filter(id => id !== c._id) : [...prev, c._id]) : navigate(`/admin/classes/${c._id}`)}
                  className={`group relative rounded-3xl p-8 border hover:shadow-xl transition-all duration-500 hover:-translate-y-1 cursor-pointer ${selectedIds.includes(c._id) ? 'bg-accent-50 border-accent-200 shadow-md' : 'bg-white border-gray-100 shadow-sm'}`}
                >
                    {/* Floating Checkbox */}
                    {isSelectMode && (
                        <div className="absolute top-6 right-6 z-10" onClick={e => e.stopPropagation()}>
                           <input 
                               type="checkbox" 
                               className="w-5 h-5 rounded border-gray-300 text-accent-500 focus:ring-accent-500 cursor-pointer shadow-sm"
                               checked={selectedIds.includes(c._id)}
                               onChange={() => setSelectedIds(prev => prev.includes(c._id) ? prev.filter(id => id !== c._id) : [...prev, c._id])}
                           />
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="p-4 bg-gray-50 rounded-2xl text-primary-950 group-hover:bg-accent-500 group-hover:text-white transition-all duration-500">
                                <BookOpen size={24} />
                            </div>
                            <div className="flex gap-2">
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setDeleteTarget(c._id); }}
                                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                                <span className="p-2 text-primary-950/20"><Activity size={14}/></span>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-3xl font-black text-primary-950 tracking-tighter leading-tight uppercase italic">{c.name}</h3>
                            <div className="flex items-center gap-2">
                               <div className="text-[10px] font-black text-accent-500 uppercase tracking-widest">{c.stream} Stream</div>
                               <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Node ID: {c._id.slice(-4)}</div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Users size={14} className="text-gray-300" />
                                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">{c.sections?.join(', ') || 0} Sectors</span>
                            </div>
                            <div className="text-[9px] font-black uppercase text-primary-950 tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                {c.classTeacher?.name || "Unassigned"}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-primary-950/20 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
           <div className="bg-white w-full max-w-lg rounded-3xl p-10 shadow-2xl relative z-10 border border-gray-100 animate-fade-up">
              <h2 className="text-3xl font-black text-primary-950 tracking-tighter uppercase italic mb-8">Structure Node</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Class Label</label>
                       <input 
                         className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none"
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                         required
                         placeholder="e.g. Grade 11"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Stream Axis</label>
                       <select 
                         className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none"
                         value={formData.stream}
                         onChange={(e) => setFormData({...formData, stream: e.target.value})}
                       >
                          <option value="General">General</option>
                          <option value="Science">Science</option>
                          <option value="Arts">Arts</option>
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Sector Identifiers (CSV)</label>
                    <input 
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none"
                      value={formData.sections}
                      onChange={(e) => setFormData({...formData, sections: e.target.value})}
                      placeholder="e.g. A, B, C (Optional)"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Faculty Lead</label>
                    <select 
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none"
                      value={formData.classTeacherId}
                      onChange={(e) => setFormData({...formData, classTeacherId: e.target.value})}
                    >
                       <option value="">Select Teacher</option>
                       {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                 </div>
                 <div className="pt-4 flex gap-4">
                    <button type="submit" className="flex-1 py-5 bg-primary-950 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-accent-500 transition-all">Establish</button>
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-5 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-widest">Cancel</button>
                 </div>
              </form>
           </div>
        </div>
      )}
      {/* Add Student Modal */}
      {isStudentModalOpen && (
        <Modal 
          isOpen={isStudentModalOpen} 
          onClose={() => setIsStudentModalOpen(false)}
          title="Direct Academic Placement"
        >
          <AddEditUserModal 
             role="student"
             predefinedClassId={targetClassForStudent}
             onClose={() => setIsStudentModalOpen(false)}
             onUserAddedOrUpdated={() => fetchData()}
          />
        </Modal>
      )}

      {showBulkModal && (
        <Modal 
          isOpen={showBulkModal} 
          onClose={() => setShowBulkModal(false)} 
          title="Bulk Import Classes"
          size="2xl"
        >
          <BulkImportModal 
              onClose={() => setShowBulkModal(false)} 
              onSuccess={fetchData} 
              templateData={classTemplate}
              templateName="Classes Template"
              expectedFileName="Class_Bulk_Import.xlsx"
              onUpload={handleBulkUpload}
          />
        </Modal>
      )}

      <ConfirmModal 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Terminate Asset?"
        message="This will permanently decommission this structural class asset. Proceed?"
        confirmText="Terminate"
      />

      <ConfirmModal 
        isOpen={deleteBulkTarget}
        onClose={() => setDeleteBulkTarget(false)}
        onConfirm={handleBulkDelete}
        title={`Terminate ${selectedIds.length} Assets?`}
        message="This will permanently decommission the selected structural assets and disconnect all their dependencies. Proceed?"
        confirmText={deletingBulk ? "Terminating..." : "Terminate Selected"}
      />
    </div>
  );
};

export default ClassesPage;
