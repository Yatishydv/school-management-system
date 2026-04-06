import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  GraduationCap,
  Search,
  Filter,
  Download,
  Upload,
  CheckSquare,
  XSquare
} from "lucide-react";
import * as xlsx from "xlsx";
import useAuthStore from "../../stores/authStore";
import Modal from "../../components/shared/Modal";
import AddEditUserModal from "../../components/admin/AddEditUserModal";
import BulkImportModal from "../../components/admin/BulkImportModal";
import adminService from "../../api/adminService";
import { toast } from "react-toastify";
import ConfirmModal from "../../components/shared/ConfirmModal";

const TeachersPage = () => {
  const { token } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [deletingBulk, setDeletingBulk] = useState(false);
  const [deleteBulkTarget, setDeleteBulkTarget] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const teacherTemplate = [
    {
        "Name*": "Jane Smith",
        "Email": "jane.smith@school.edu",
        "Phone": "5551234567",
        "Address": "456 Education Ave"
    }
  ];

  const handleBulkUpload = async (jsonData) => {
      const usersPayload = jsonData.map(row => ({
          name: row["Name*"],
          email: row["Email"],
          phone: row["Phone"] ? String(row["Phone"]) : undefined,
          address: row["Address"],
          role: 'teacher'
      })).filter(u => u.name);

      if (usersPayload.length === 0) {
          toast.error("No valid teacher names found in the file.");
          return false;
      }

      const response = await adminService.bulkAddUsers({ users: usersPayload }, token);
      
      if (response.results.failed > 0) {
          toast.warning(`Imported ${response.results.successful} records. Failed: ${response.results.failed}. check console for details.`);
          console.error("Bulk Import Errors:", response.results.errors);
          return true; 
      } else {
          toast.success("All teachers imported successfully!");
          return true;
      }
  };

  const handleExport = () => {
    if (users.length === 0) {
      toast.warning("No data to export");
      return;
    }
    const exportData = users.map(u => ({
        "Name": u.name,
        "Teacher ID": u.uniqueId,
        "Email": u.email || '',
        "Phone": u.phone || '',
        "Address": u.address || '',
        "Join Date": u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''
    }));
    const ws = xlsx.utils.json_to_sheet(exportData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Teachers");
    xlsx.writeFile(wb, "Teachers_Export.xlsx");
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteUser(deleteTarget._id, token);
      fetchTeachers();
      toast.success("Record Redacted.");
    } catch (err) {
      toast.error("Failed to delete user.");
    }
  };

  const handleBulkDelete = async () => {
    setDeletingBulk(true);
    try {
      for (const id of selectedIds) {
          await adminService.deleteUser(id, token);
      }
      toast.success(`${selectedIds.length} Records Redacted.`);
      fetchTeachers();
      setSelectedIds([]);
      setIsSelectMode(false);
    } catch (err) {
      toast.error("Process partially failed. Some users may not have been deleted.");
      fetchTeachers();
    } finally {
      setDeletingBulk(false);
      setDeleteBulkTarget(false);
    }
  };

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getUsers("teacher", token);
      setUsers(res || []);
    } catch (err) {
      toast.error("Failed to sync faculty archives.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) fetchTeachers();
  }, [token]);

  useEffect(() => {
     setSelectedIds([]);
     setIsSelectMode(false);
  }, [searchTerm]);

  const handleAdd = () => {
    setEditingUser(null);
    setShowModal(true);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.uniqueId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 space-y-12 pb-24 relative overflow-hidden">
      {/* Watermark */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-[20vw] font-black text-gray-100/50 pointer-events-none select-none tracking-tighter uppercase whitespace-nowrap">
        FACULTY
      </div>

      <header className="px-8 md:px-14 pt-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-accent-500"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Teacher Management</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none text-primary-950">
              Teacher <span className="text-gray-200">List.</span>
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
               onClick={handleAdd}
               className="px-6 py-4 rounded-2xl bg-primary-950 text-white hover:bg-accent-500 transition-all flex items-center gap-3 group shadow-xl shadow-primary-950/20"
             >
                <span className="text-xs font-black uppercase tracking-widest hidden md:block">Teacher</span>
                <Plus size={20} className="group-hover:rotate-180 transition-transform duration-500" />
             </button>
         </div>
      </header>

      <div className="px-8 md:px-14 relative z-10 text-xs">
        <div className="flex flex-col md:flex-row gap-6 mb-12">
            <div className="flex-1 relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent-500 transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Search Teachers..."
                    className="w-full pl-16 pr-8 py-5 bg-white rounded-2xl border border-gray-100 shadow-sm outline-none focus:ring-4 focus:ring-accent-50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="px-6 py-5 bg-white rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-primary-950 flex items-center gap-3 shadow-sm">
                <GraduationCap size={16} className="text-accent-500" />
                Total Teachers: {filteredUsers.length}
            </div>
        </div>

        <section className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm overflow-hidden animate-fade-up">
           <table className="w-full border-separate border-spacing-y-4">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">
                  {isSelectMode && (
                      <th className="px-8 pb-4 w-16">
                         <input 
                             type="checkbox" 
                             className="w-4 h-4 rounded border-gray-300 text-accent-500 focus:ring-accent-500 cursor-pointer"
                             checked={filteredUsers.length > 0 && selectedIds.length === filteredUsers.length}
                             onChange={(e) => setSelectedIds(e.target.checked ? filteredUsers.map(u => u._id) : [])}
                         />
                      </th>
                  )}
                  <th className="px-8 pb-4">Name</th>
                  <th className="px-8 pb-4">Teacher ID</th>
                  <th className="px-8 pb-4">Email</th>
                  <th className="px-8 pb-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="space-y-4">
                {filteredUsers.map((u) => (
                  <tr 
                     key={u._id} 
                     className={`group transition-all duration-300 rounded-2xl ${isSelectMode ? 'cursor-pointer' : ''} ${selectedIds.includes(u._id) ? 'bg-accent-50' : 'hover:bg-gray-50'}`}
                     onClick={isSelectMode ? () => setSelectedIds(prev => prev.includes(u._id) ? prev.filter(id => id !== u._id) : [...prev, u._id]) : undefined}
                  >
                    {isSelectMode && (
                        <td className="px-8 py-6 rounded-l-2xl border-y border-l border-transparent group-hover:border-gray-100" onClick={e => e.stopPropagation()}>
                           <input 
                               type="checkbox" 
                               className="w-4 h-4 rounded border-gray-300 text-accent-500 focus:ring-accent-500 cursor-pointer"
                               checked={selectedIds.includes(u._id)}
                               onChange={() => setSelectedIds(prev => prev.includes(u._id) ? prev.filter(id => id !== u._id) : [...prev, u._id])}
                           />
                        </td>
                    )}
                    <td className={`px-8 py-6 border-y border-transparent group-hover:border-gray-100 ${!isSelectMode ? 'rounded-l-2xl border-l' : ''}`}>
                       <span className="font-black text-primary-950 tracking-tight">{u.name}</span>
                    </td>
                    <td className="px-8 py-6 border-y border-transparent group-hover:border-gray-100">
                       <span className="font-black text-[10px] text-accent-500 bg-accent-500/5 px-4 py-1.5 rounded-full tracking-widest italic">{u.uniqueId}</span>
                    </td>
                    <td className="px-8 py-6 border-y border-transparent group-hover:border-gray-100">
                       <span className="text-xs font-bold text-gray-500">{u.email}</span>
                    </td>
                    <td className="px-8 py-7 rounded-r-2xl text-right border-y border-r border-transparent group-hover:border-gray-100">
                       <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => { setEditingUser(u); setShowModal(true); }} className="p-3 bg-white border border-gray-100 rounded-xl text-primary-950 hover:bg-primary-950 hover:text-white transition-all shadow-sm"><Edit2 size={14}/></button>
                          <button onClick={() => setDeleteTarget(u)} className="p-3 bg-white border border-gray-100 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={14}/></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </section>
      </div>

      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={editingUser ? "Edit Teacher Details" : "Add New Teacher"}
        size="5xl"
      >
        <AddEditUserModal onClose={() => setShowModal(false)} onUserAddedOrUpdated={fetchTeachers} user={editingUser} role="teacher" />
      </Modal>

      <Modal 
        isOpen={showBulkModal} 
        onClose={() => setShowBulkModal(false)} 
        title="Bulk Import Teachers"
        size="2xl"
      >
        <BulkImportModal 
            onClose={() => setShowBulkModal(false)} 
            onSuccess={fetchTeachers} 
            templateData={teacherTemplate}
            templateName="Teachers Template"
            expectedFileName="Teacher_Bulk_Import.xlsx"
            onUpload={handleBulkUpload}
        />
      </Modal>

      <ConfirmModal 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Archive Teacher?"
        message="This action permanently archives this structural asset and its records."
        confirmText="Archive"
      />

      <ConfirmModal 
        isOpen={deleteBulkTarget}
        onClose={() => setDeleteBulkTarget(false)}
        onConfirm={handleBulkDelete}
        title={`Archive ${selectedIds.length} Teachers?`}
        message="This action permanently archives the selected assets and their records. Ensure accuracy before proceeding."
        confirmText={deletingBulk ? "Archiving..." : "Archive Selected"}
      />
    </div>
  );
};

export default TeachersPage;
