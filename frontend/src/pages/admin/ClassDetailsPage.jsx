// frontend/src/pages/admin/ClassDetailsPage.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Users, 
  BookOpen, 
  Plus, 
  ArrowLeft, 
  GraduationCap, 
  UserPlus,
  Trash2,
  Phone,
  Mail,
  MoreVertical,
  Activity,
  Layers,
  Edit,
  Shield,
  Search,
  ExternalLink,
  Edit2,
  Download,
  Upload
} from "lucide-react";
import * as xlsx from "xlsx";
import { saveAs } from 'file-saver';
import { exportToExcel } from "../../utils/excelExport";
import adminService from "../../api/adminService";
import useAuthStore from "../../stores/authStore";
import { toast } from "react-toastify";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/shared/Modal";
import AddEditUserModal from "../../components/admin/AddEditUserModal";
import BulkImportModal from "../../components/admin/BulkImportModal";
import ConfirmModal from "../../components/shared/ConfirmModal";
import EnrollExistingModal from "../../components/admin/EnrollExistingModal";

const ClassDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isEnrollExistingOpen, setIsEnrollExistingOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [newSubject, setNewSubject] = useState({ name: "", code: "", assignedTeacherIds: [] });
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [deleteSubjectTarget, setDeleteSubjectTarget] = useState(null);
  const [deleteClassTarget, setDeleteClassTarget] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [classFormData, setClassFormData] = useState({
    name: "", stream: "General", sections: "", classTeacherId: ""
  });

  const openEditClassModal = () => {
    if (!data?.class) return;
    setClassFormData({
      name: data.class.name,
      stream: data.class.stream || "General",
      sections: data.class.sections ? data.class.sections.join(', ') : "",
      classTeacherId: data.class.classTeacher?._id || ""
    });
    setIsEditClassModalOpen(true);
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    try {
      const sectionsArray = classFormData.sections.trim() !== "" 
        ? classFormData.sections.split(',').map(s => s.trim().toUpperCase()).filter(s => s !== "")
        : [];
      await adminService.updateClass(id, { ...classFormData, sections: sectionsArray }, token);
      toast.success("Structural asset updated.");
      setIsEditClassModalOpen(false);
      fetchDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update node.");
    }
  };

  const openAddSubjectModal = () => {
      setEditingSubjectId(null);
      setNewSubject({ name: "", code: "", assignedTeacherIds: [] });
      setIsSubjectModalOpen(true);
  };

  const openEditSubjectModal = (subject) => {
      setEditingSubjectId(subject._id);
      setNewSubject({
          name: subject.name,
          code: subject.code,
          assignedTeacherIds: subject.assignedTeachers?.map(t => t._id) || []
      });
      setIsSubjectModalOpen(true);
  };

  const fetchDetails = async () => {
    try {
      const [res, teacherRes] = await Promise.all([
        adminService.getClassDetails(id, token),
        adminService.getUsers("teacher", token)
      ]);
      setData(res);
      setTeachers(teacherRes);
    } catch (err) {
      toast.error("Failed to fetch node telemetry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDetails();
  }, [token, id]);

  const handleAddSubject = async (e) => {
    e.preventDefault();
    try {
      if (editingSubjectId) {
          await adminService.updateSubject(editingSubjectId, { ...newSubject, classId: id }, token);
          toast.success("Academic Unit Updated.");
      } else {
          await adminService.addSubject({ ...newSubject, classId: id }, token);
          toast.success("Academic Unit Embedded.");
      }
      setIsSubjectModalOpen(false);
      setNewSubject({ name: "", code: "", assignedTeacherIds: [] });
      setEditingSubjectId(null);
      fetchDetails();
    } catch (err) {
      toast.error("Process failed.");
    }
  };

  const handleDeleteSubject = async () => {
    if (!deleteSubjectTarget) return;
    try {
      await adminService.deleteSubject(deleteSubjectTarget, token);
      toast.success("Academic Unit Decommissioned.");
      setDeleteSubjectTarget(null);
      fetchDetails();
    } catch (err) {
      toast.error("Process termination failed.");
    }
  };

  const handleDeleteClass = async () => {
    if (!deleteClassTarget) return;
    try {
      await adminService.deleteClass(id, token);
      toast.success("Structural asset removed.");
      setDeleteClassTarget(false);
      navigate('/admin/classes');
    } catch (err) {
      toast.error("Deletion failed.");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-white"><Spinner size="xl" /></div>;
  if (!data) return <div className="p-20 text-center font-black uppercase text-gray-300 tracking-widest">Node Not Found</div>;

  const { class: cls, subjects, students } = data;

  const studentTemplate = [
    {
        "Name*": "John Doe",
        "Email": "john@example.com",
        "Phone": "9876543210",
        "Address": "123 Main St",
        "Class": cls?.name || "Class 10",
        "Roll Number": "10A01",
        "Father Name": "Richard Doe",
        "Mother Name": "Jane Doe",
        "DOB (YYYY-MM-DD)": "2010-05-15",
        "Previous School": "Springfield High"
    }
  ];

  const handleBulkUpload = async (jsonData) => {
      const usersPayload = jsonData.map(row => ({
          name: row["Name*"],
          email: row["Email"],
          phone: row["Phone"] ? String(row["Phone"]) : undefined,
          address: row["Address"],
          Class: row["Class"] || cls.name,
          rollNumber: row["Roll Number"],
          fatherName: row["Father Name"],
          motherName: row["Mother Name"],
          dob: row["DOB (YYYY-MM-DD)"],
          prevSchool: row["Previous School"],
          role: 'student'
      })).filter(u => u.name);

      if (usersPayload.length === 0) {
          toast.error("No valid student names found in the file.");
          return false;
      }

      const response = await adminService.bulkAddUsers({ users: usersPayload }, token);
      
      if (response.results.failed > 0) {
          toast.warning(`Imported ${response.results.successful} records. Failed: ${response.results.failed}. check console for details.`);
          console.error("Bulk Import Errors:", response.results.errors);
          fetchDetails();
          return true; 
      } else {
          toast.success("All students imported successfully!");
          fetchDetails();
          return true;
      }
  };

  const handleExport = () => {
    if (students.length === 0) {
      toast.warning("No data to export");
      return;
    }
    const exportData = students.map(u => ({
        "Name*": u.name,
        "Student ID": u.uniqueId,
        "Email": u.email || '',
        "Phone": u.phone || '',
        "Address": u.address || '',
        "Class": cls.name,
        "Roll Number": u.rollNumber || '',
        "Father Name": u.fatherName || '',
        "Mother Name": u.motherName || '',
        "DOB (YYYY-MM-DD)": u.dob || '',
        "Previous School": u.prevSchool || '',
        "Admission Date": u.admissionDate ? new Date(u.admissionDate).toLocaleDateString() : ''
    }));
    exportToExcel(exportData, `${cls.name}_Students`, `${cls.name}_Students_Export.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-hidden">
      {/* Background Decal */}
      <div className="absolute top-[-5%] right-[-5%] text-[25vw] font-black text-gray-50 pointer-events-none select-none tracking-tighter uppercase whitespace-nowrap -rotate-6">
        {cls.name}
      </div>

      <div className="px-8 md:px-14 pt-16 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-20">
           <button 
              onClick={() => navigate('/admin/classes')}
              className="group flex items-center gap-3 text-gray-400 hover:text-primary-950 transition-all px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">Exit Hub</span>
            </button>
            <div className="flex gap-3">
               <button 
                 onClick={openEditClassModal}
                 className="p-4 bg-white border border-gray-100 rounded-2xl text-primary-950 hover:bg-primary-950 hover:text-white transition-all shadow-sm"
               >
                 <Edit size={16}/>
               </button>
               <button 
                 onClick={() => setDeleteClassTarget(true)}
                 className="p-4 bg-white border border-gray-100 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
               >
                 <Trash2 size={16}/>
               </button>
            </div>
        </div>

        <header className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-accent-50 rounded-full border border-accent-100">
              <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-accent-700">Structural Node Active</span>
            </div>
            <div>
              <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-none text-primary-950 uppercase italic">
                {cls.name.split(' ')[0]} <br/> <span className="text-gray-200">{cls.name.split(' ').slice(1).join(' ')}</span>
              </h1>
              <div className="flex flex-wrap items-center gap-6 mt-12">
                 <div className="space-y-1">
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Faculty Lead</p>
                    <p className="text-sm font-black text-primary-950 uppercase italic">{cls.classTeacher?.name || "Unassigned"}</p>
                 </div>
                 <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Stream Axis</p>
                    <p className="text-sm font-black text-accent-500 uppercase italic">{cls.stream}</p>
                 </div>
                 <div className="w-1 h-1 rounded-full bg-gray-200"></div>
                 <div className="space-y-1">
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Node ID</p>
                    <p className="text-sm font-black text-gray-400 tabular-nums uppercase">#{id.slice(-6)}</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-end items-start lg:items-end gap-6">
             <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
                <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm space-y-2">
                   <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Students</p>
                   <p className="text-4xl font-black text-primary-950 tabular-nums italic">{students.length}</p>
                </div>
                <div className="p-8 bg-white border border-gray-100 rounded-[2.5rem] shadow-sm space-y-2">
                   <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">Subjects</p>
                   <p className="text-4xl font-black text-primary-950 tabular-nums italic">{subjects.length}</p>
                </div>
             </div>
             <div className="flex gap-4 w-full">
                <button 
                  onClick={openAddSubjectModal}
                  className="flex-1 px-4 py-5 bg-white border border-primary-950 text-primary-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-950 hover:text-white transition-all shadow-xl shadow-primary-950/5 flex justify-center items-center gap-2"
                >
                  <BookOpen size={14} /> Add Subject
                </button>
                <button 
                   onClick={() => setIsStudentModalOpen(true)}
                   className="flex-1 px-4 py-5 bg-primary-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-primary-950/20 flex justify-center items-center gap-2"
                >
                  <UserPlus size={14} /> New Student
                </button>
                <button 
                   onClick={() => setIsEnrollExistingOpen(true)}
                   className="flex-1 px-4 py-5 bg-white border-2 border-primary-950 text-primary-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-950 hover:text-white transition-all shadow-sm flex justify-center items-center gap-2"
                >
                  <Users size={14} /> Enrol Existing
                </button>
             </div>
             <div className="flex gap-4 w-full">
                <button 
                   onClick={handleExport}
                   className="flex-1 py-4 bg-white border border-gray-100 text-primary-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-500 transition-all flex justify-center items-center gap-2"
                >
                   <Download size={14} /> Export
                </button>
                <button 
                   onClick={() => setShowBulkModal(true)}
                   className="flex-1 py-4 bg-white border border-gray-100 text-primary-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-accent-500 hover:text-accent-500 transition-all flex justify-center items-center gap-2"
                >
                   <Upload size={14} /> Import Bulk
                </button>
             </div>
          </div>
        </header>

        <div className="space-y-32 mb-40">
           {/* SUBJECTS REGISTRY */}
           <section className="space-y-12">
              <div className="flex items-center gap-6">
                 <h2 className="text-4xl font-black uppercase italic tracking-tighter text-primary-950">Academic Units</h2>
                 <div className="h-px flex-1 bg-gray-100"></div>
                 <div className="p-3 bg-white border border-gray-100 rounded-xl text-gray-300"><Layers size={20}/></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                 {subjects.map((sub, idx) => (
                    <div key={sub._id} className="group relative bg-white p-10 rounded-[3rem] border border-gray-100 hover:border-accent-500 transition-all shadow-sm hover:shadow-2xl hover:-translate-y-2">
                       <span className="absolute top-10 right-10 text-[10px] font-black text-gray-200 uppercase tabular-nums">NODE {idx + 1}</span>
                       <div className="space-y-10">
                          <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center text-primary-950 group-hover:bg-accent-500 group-hover:text-white transition-all">
                             <BookOpen size={28} />
                          </div>
                          <div>
                             <h4 className="text-3xl font-black text-primary-950 uppercase italic leading-none">{sub.name}</h4>
                             <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-2">{sub.code}</p>
                          </div>
                          <div className="pt-6 border-t border-gray-50 flex justify-between items-center">
                             <div className="space-y-1">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Assigned Faculty</p>
                                <p className="text-[11px] font-black text-primary-950 uppercase italic">
                                  {sub.assignedTeachers?.length > 0 
                                    ? sub.assignedTeachers.map(t => t.name).join(', ') 
                                    : "Unassigned"}
                                </p>
                             </div>
                              <div className="flex gap-2">
                                  <button 
                                    onClick={() => openEditSubjectModal(sub)}
                                    className="p-3 text-gray-300 hover:text-primary-950 transition-colors"
                                  >
                                    <Edit2 size={16}/>
                                  </button>
                                  <button 
                                    onClick={() => setDeleteSubjectTarget(sub._id)}
                                    className="p-3 text-gray-300 hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 size={16}/>
                                  </button>
                              </div>
                          </div>
                       </div>
                    </div>
                 ))}
                 {subjects.length === 0 && (
                   <div className="col-span-full py-32 bg-white rounded-[4rem] border border-dashed border-gray-100 flex flex-col items-center justify-center text-center gap-6">
                      <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-200">
                        <Activity size={40} />
                      </div>
                      <p className="text-xs font-black uppercase text-gray-300 tracking-[0.4em]">No subjects registered for this node axis</p>
                      <button onClick={openAddSubjectModal} className="px-8 py-4 bg-primary-950 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Initialize Subject Node</button>
                   </div>
                 )}
              </div>
           </section>

           {/* PERSONNEL REGISTRY */}
           <section className="space-y-12">
              <div className="flex items-center gap-6">
                 <h2 className="text-4xl font-black uppercase italic tracking-tighter text-primary-950">Registered Personnel</h2>
                 <div className="h-px flex-1 bg-gray-100"></div>
                 <div className="p-3 bg-white border border-gray-100 rounded-xl text-gray-300"><Users size={20}/></div>
              </div>

              <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-xl overflow-hidden">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-[#fafafa] border-b border-gray-100">
                             <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Personnel Identity</th>
                             <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Roll Axis</th>
                             <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Digital Registry</th>
                             <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Status</th>
                             <th className="px-12 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                          {students.map(person => (
                             <tr key={person._id} className="group hover:bg-[#fafafa] transition-all">
                                <td className="px-12 py-10">
                                   <div className="flex items-center gap-6">
                                      <div className="w-14 h-14 rounded-[1.5rem] bg-primary-950 text-white flex items-center justify-center text-xl font-black italic shadow-lg shadow-primary-950/10">
                                         {person.name.charAt(0)}
                                      </div>
                                      <div>
                                         <p className="text-base font-black text-primary-950 uppercase italic leading-none">{person.name}</p>
                                         <p className="text-[10px] font-bold text-gray-300 uppercase tracking-tight mt-2 italic">ID: {person.uniqueId}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-12 py-10">
                                   <span className="px-5 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-black tabular-nums text-primary-950">
                                      {person.rollNumber || "---"}
                                   </span>
                                </td>
                                <td className="px-12 py-10">
                                   <div className="space-y-3">
                                      <div className="flex items-center gap-2 text-gray-400 group-hover:text-primary-950 transition-colors">
                                         <Mail size={12} className="text-accent-500" />
                                         <span className="text-[11px] font-medium lowecase">{person.email || "registry@system.com"}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-gray-400 group-hover:text-primary-950 transition-colors">
                                         <Phone size={12} className="text-gray-300" />
                                         <span className="text-[11px] font-medium">{person.phone || "---"}</span>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-12 py-10">
                                   <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full border border-green-100 text-[9px] font-black uppercase tracking-widest">
                                      Verified
                                   </div>
                                </td>
                                <td className="px-12 py-10">
                                   <button 
                                     onClick={() => navigate('/admin/students')}
                                     className="p-3 bg-gray-50 rounded-xl text-gray-300 hover:text-primary-950 hover:bg-white hover:shadow-md transition-all"
                                   >
                                      <ExternalLink size={16} />
                                   </button>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
                 {students.length === 0 && (
                    <div className="py-40 text-center space-y-6">
                       <Activity size={60} className="mx-auto text-gray-100" />
                       <div className="space-y-2">
                          <p className="text-xl font-black text-gray-300 uppercase tracking-widest italic">Registry Empty</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">No personnel synced with this node axis yet.</p>
                       </div>
                    </div>
                 )}
              </div>
           </section>
        </div>
      </div>

      {/* STUDENT MODAL */}
      {isStudentModalOpen && (
        <Modal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} title="Registry Placement" size="5xl">
          <AddEditUserModal 
             role="student"
             predefinedClassId={id}
             onClose={() => setIsStudentModalOpen(false)}
             onUserAddedOrUpdated={fetchDetails}
          />
        </Modal>
      )}

      {/* ENROLL EXISTING MODAL */}
      {isEnrollExistingOpen && (
        <Modal 
          isOpen={isEnrollExistingOpen} 
          onClose={() => setIsEnrollExistingOpen(false)} 
          title="Registry Migration" 
          size="4xl"
        >
          <EnrollExistingModal 
            classId={id}
            onClose={() => setIsEnrollExistingOpen(false)}
            onSuccess={fetchDetails}
          />
        </Modal>
      )}

      {/* SUBJECT MODAL */}
      {isSubjectModalOpen && (
        <Modal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} title={editingSubjectId ? "Update Subject Node" : "Embed Subject Node"}>
           <form onSubmit={handleAddSubject} className="p-14 space-y-10">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-2 h-2 rounded-full bg-accent-500 shadow-lg shadow-accent-500/20"></div>
                 <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Node Parameters</span>
              </div>

              <div className="grid grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary-950 ml-1 italic">Subject Label</label>
                    <input 
                      required
                      className="w-full px-8 py-5 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-gray-100 outline-none transition-all"
                      placeholder="e.g. Mathematics"
                      value={newSubject.name}
                      onChange={e => setNewSubject({...newSubject, name: e.target.value})}
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary-950 ml-1 italic">Process Code</label>
                    <input 
                      required
                      className="w-full px-8 py-5 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-gray-100 outline-none transition-all"
                      placeholder="e.g. MATH-101"
                      value={newSubject.code}
                      onChange={e => setNewSubject({...newSubject, code: e.target.value})}
                    />
                 </div>
              </div>

              <div className="space-y-4">
                 <label className="text-[10px] font-black uppercase tracking-widest text-primary-950 ml-1 italic">Faculty Assignment</label>
                 <select 
                     className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none"
                     value={newSubject.assignedTeacherIds[0] || ""}
                     onChange={(e) => setNewSubject({...newSubject, assignedTeacherIds: e.target.value ? [e.target.value] : []})}
                 >
                     <option value="">Select Faculty</option>
                     {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                 </select>
              </div>

               <div className="pt-10 flex gap-6">
                 <button type="submit" className="flex-1 py-6 bg-primary-950 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary-950/20 hover:bg-accent-500 transition-all text-xs">{editingSubjectId ? "Update" : "Embed"}</button>
                 <button type="button" onClick={() => setIsSubjectModalOpen(false)} className="px-12 py-6 bg-gray-50 text-gray-400 rounded-3xl font-black uppercase tracking-widest text-xs">Abort</button>
              </div>
           </form>
        </Modal>
      )}

       {/* BULK IMPORT MODAL */}
      {showBulkModal && (
        <Modal 
          isOpen={showBulkModal} 
          onClose={() => setShowBulkModal(false)} 
          title={`Bulk Enrol - ${cls.name}`}
          size="2xl"
        >
          <BulkImportModal 
              onClose={() => setShowBulkModal(false)} 
              onSuccess={fetchDetails} 
              templateData={studentTemplate}
              templateName={`${cls.name} Student Template`}
              expectedFileName={`${cls.name.replace(/\s+/g, '_')}_Students.xlsx`}
              onUpload={handleBulkUpload}
          />
        </Modal>
      )}

      {/* EDIT CLASS MODAL */}
      {isEditClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
           <div className="absolute inset-0 bg-primary-950/20 backdrop-blur-sm" onClick={() => setIsEditClassModalOpen(false)}></div>
           <div className="bg-white w-full max-w-lg rounded-3xl p-10 shadow-2xl relative z-10 border border-gray-100 animate-fade-up">
              <h2 className="text-3xl font-black text-primary-950 tracking-tighter uppercase italic mb-8">Update Node</h2>
              <form onSubmit={handleUpdateClass} className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Class Label</label>
                       <input 
                         className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none"
                         value={classFormData.name}
                         onChange={(e) => setClassFormData({...classFormData, name: e.target.value})}
                         required
                         placeholder="e.g. Grade 11"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Stream Axis</label>
                       <select 
                         className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none"
                         value={classFormData.stream}
                         onChange={(e) => setClassFormData({...classFormData, stream: e.target.value})}
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
                      value={classFormData.sections}
                      onChange={(e) => setClassFormData({...classFormData, sections: e.target.value})}
                      placeholder="e.g. A, B, C (Optional)"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Faculty Lead</label>
                    <select 
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none"
                      value={classFormData.classTeacherId}
                      onChange={(e) => setClassFormData({...classFormData, classTeacherId: e.target.value})}
                    >
                       <option value="">Select Teacher</option>
                       {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                 </div>
                 <div className="pt-4 flex gap-4">
                    <button type="submit" className="flex-1 py-5 bg-primary-950 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-accent-500 transition-all">Synchronize</button>
                    <button type="button" onClick={() => setIsEditClassModalOpen(false)} className="px-8 py-5 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-widest">Cancel</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteClassTarget}
        onClose={() => setDeleteClassTarget(false)}
        onConfirm={handleDeleteClass}
        title="Terminate Asset?"
        message="This will permanently decommission this academic unit and disconnect all dependencies. Proceed?"
        confirmText="Terminate Asset"
      />

      <ConfirmModal 
        isOpen={!!deleteSubjectTarget}
        onClose={() => setDeleteSubjectTarget(null)}
        onConfirm={handleDeleteSubject}
        title="Decommission Unit?"
        message="Are you sure you want to decommission this academic subject unit?"
        confirmText="Decommission"
      />
    </div>
  );
};

export default ClassDetailsPage;
