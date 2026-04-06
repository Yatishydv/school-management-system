import React, { useEffect, useState } from "react";
import {
  FileText,
  Search,
  Calendar,
  Phone,
  User,
  Activity,
  Trash2,
  XCircle,
  Clock
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import Modal from "../../components/shared/Modal";
import AddEditUserModal from "../../components/admin/AddEditUserModal";
import useAuthStore from "../../stores/authStore";

const AdmissionsList = () => {
  const { token } = useAuthStore();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchAdmissions = async () => {
    try {
      const res = await axios.get("http://localhost:5005/api/admissions/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data.data || []);
    } catch (err) {
      toast.error("Failed to sync enrollment matrix.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.patch(`http://localhost:5005/api/admissions/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(`Application ${status}`);
      fetchAdmissions();
    } catch (err) {
      toast.error("Failed to update application status.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5005/api/admissions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Application deleted.");
      setDeleteConfirmId(null);
      fetchAdmissions();
    } catch (err) {
      toast.error("Failed to purge application record.");
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const filteredData = data.filter(a => 
    a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.classApplied.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/50 space-y-12 pb-24 relative overflow-hidden">
      {/* Watermark */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-[20vw] font-black text-gray-100/50 pointer-events-none select-none tracking-tighter uppercase whitespace-nowrap">
        ADMISSIONS
      </div>

      <header className="px-8 md:px-14 pt-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-accent-500"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Enrollment Portal</span>
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none text-primary-950">
                Inbound <span className="text-gray-200">Archive.</span>
            </h1>
         </div>
         
         <div className="px-6 py-5 bg-white rounded-2xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-primary-950 flex items-center gap-3 shadow-sm">
            <FileText size={16} className="text-accent-500" />
            Applications: {filteredData.length}
         </div>
      </header>

      <div className="px-8 md:px-14 relative z-10">
        <div className="mb-12 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent-500 transition-colors" size={20} />
            <input 
                type="text" 
                placeholder="Search Enrollment Archive..."
                className="w-full pl-16 pr-8 py-5 bg-white rounded-2xl border border-gray-100 shadow-sm outline-none focus:ring-4 focus:ring-accent-50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <section className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm overflow-hidden animate-fade-up">
           <table className="w-full border-separate border-spacing-y-4">
              <thead>
                <tr className="text-left text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">
                  <th className="px-8 pb-4">Identity</th>
                  <th className="px-8 pb-4">Academic Node</th>
                  <th className="px-8 pb-4">Contact Matrix</th>
                   <th className="px-8 pb-4 text-right">Commit Date</th>
                   <th className="px-8 pb-4 text-right">Status</th>
                   <th className="px-8 pb-4 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="space-y-4">
                 {filteredData.map((s) => (
                   <tr key={s._id} className="group hover:bg-gray-50 transition-all duration-300 rounded-2xl">
                     <td className="px-8 py-6 rounded-l-2xl border-y border-l border-transparent group-hover:border-gray-100">
                        <span className="font-black text-primary-950 tracking-tight uppercase italic">{s.studentName}</span>
                     </td>
                     <td className="px-8 py-6 border-y border-transparent group-hover:border-gray-100">
                        <span className="font-black text-[10px] text-accent-500 bg-accent-500/5 px-4 py-1.5 rounded-full tracking-widest">{s.classApplied}</span>
                     </td>
                     <td className="px-8 py-6 border-y border-transparent group-hover:border-gray-100">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                           <Phone size={12} className="text-gray-200" />
                           {s.phone}
                        </div>
                     </td>
                     <td className="px-8 py-7 text-right border-y border-transparent group-hover:border-gray-100">
                        <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] font-black text-primary-950 tabular-nums">
                                {new Date(s.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                            </span>
                            <span className="text-[8px] font-bold text-gray-300 uppercase tracking-widest">
                                {new Date(s.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                     </td>
                     <td className="px-8 py-7 text-right border-y border-transparent group-hover:border-gray-100">
                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest inline-block border ${
                           s.status === 'Admitted' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                           s.status === 'Rejected' ? 'bg-red-50 text-red-600 border-red-100' :
                           'bg-gray-50 text-gray-400 border-gray-100'
                        }`}>
                           {s.status || 'Pending'}
                        </div>
                     </td>
                      <td className="px-8 py-7 rounded-r-2xl text-right border-y border-r border-transparent group-hover:border-gray-100">
                        <div className="flex items-center justify-end gap-2">
                            {deleteConfirmId === s._id ? (
                                <div className="flex items-center gap-2 animate-fade-in">
                                    <button 
                                        onClick={() => handleDelete(s._id)}
                                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/10"
                                    >
                                        Confirm
                                    </button>
                                    <button 
                                        onClick={() => setDeleteConfirmId(null)}
                                        className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <button 
                                      onClick={() => {
                                        setSelectedApplicant({
                                          name: s.studentName,
                                          email: s.email || "", 
                                          phone: s.phone,
                                          address: s.address || "",
                                          admissionId: s._id,
                                        });
                                        setIsProcessModalOpen(true);
                                      }}
                                      disabled={s.status === 'Admitted'}
                                      className="px-4 py-2 bg-primary-950 text-white rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-accent-500 transition-all shadow-lg shadow-primary-950/10 disabled:opacity-30 disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
                                      title="Admit Student"
                                    >
                                      Process
                                    </button>
                                    
                                    {s.status === 'Pending' && (
                                        <button 
                                            onClick={() => handleUpdateStatus(s._id, 'Rejected')}
                                            className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                            title="Reject Application"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    )}

                                    <button 
                                        onClick={() => setDeleteConfirmId(s._id)}
                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                        title="Delete Record"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </>
                            )}
                        </div>
                      </td>
                   </tr>
                 ))}
               </tbody>
            </table>
         </section>
      </div>

      {isProcessModalOpen && (
        <Modal 
          isOpen={isProcessModalOpen} 
          onClose={() => setIsProcessModalOpen(false)}
          title="Admission Processing"
          size="5xl"
        >
          <AddEditUserModal 
             role="student"
             user={selectedApplicant}
             onClose={() => setIsProcessModalOpen(false)}
             onUserAddedOrUpdated={() => fetchAdmissions()}
          />
        </Modal>
      )}
    </div>
  );
};

export default AdmissionsList;
