import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Download,
  Plus,
  Edit2,
  Trash2,
  Key,
  UserPlus,
  Users,
  Shield,
  MessageCircle,
  Image,
} from "lucide-react";
import { Link } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import { saveAs } from "file-saver";
import Modal from "../../components/shared/Modal";
import ConfirmModal from "../../components/shared/ConfirmModal";
import AddEditUserModal from "../../components/admin/AddEditUserModal";
import adminService from "../../api/adminService";
import { toast } from "react-toastify";

const KPI = ({ title, value, sub, icon: Icon, color, link, isHero }) => (
  <Link to={link || "#"} className={`group relative block bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1 w-full box-border overflow-hidden ${isHero ? 'h-full flex flex-col' : ''}`}>
    {/* Absolute Icon Background Decor */}
    <div className={`absolute -top-4 -right-4 p-8 rounded-full bg-gray-50 text-gray-100 group-hover:bg-accent-500/10 group-hover:text-accent-500/20 transition-all duration-500 ${isHero ? 'scale-150 origin-top-right opacity-20' : ''}`}>
      {Icon && <Icon size={isHero ? 120 : 80} strokeWidth={1} />}
    </div>

    <div className={`relative z-10 flex flex-col justify-between flex-1 ${isHero ? 'space-y-12' : 'space-y-6'}`}>
      <div className={`w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-primary-950 group-hover:bg-accent-500 group-hover:text-white transition-all duration-500 shadow-sm`}>
        {Icon && <Icon size={20} />}
      </div>
      
      <div className="space-y-2">
        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 break-words leading-relaxed mb-1">{title}</div>
        <div className={`${isHero ? 'text-4xl sm:text-5xl lg:text-6xl' : 'text-2xl sm:text-3xl lg:text-4xl'} font-black text-primary-950 tracking-tighter leading-none whitespace-nowrap`} title={value}>{value}</div>
        {sub && <div className="text-[10px] font-bold text-accent-500 flex items-center gap-1.5 pt-4 border-t border-gray-50/50">
          <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></div>
          <span className="uppercase tracking-[0.2em] font-black">{sub}</span>
        </div>}
      </div>
    </div>
  </Link>
);

const AdminDashboard = () => {
  const { token } = useAuthStore();

  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    pendingFees: 0,
    classes: 0,
    galleryCount: 0,
    monthlyRegistrations: [],
  });

  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState("student");
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);

  // Modal state
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const fetchStats = async () => {
    try {
      const res = await adminService.getDashboardStats(token);
      setStats(res || { monthlyRegistrations: [] });
    } catch (err) {
      toast.error("Failed to sync institutional metrics.");
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await adminService.getUsers(roleFilter, token);
      setUsers(res || []);
    } catch (err) {
      toast.error("Failed to fetch registry.");
    }
    setLoadingUsers(false);
  };

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchUsers();
    }
  }, [roleFilter, token]);

  const handleAddUser = (role) => {
    setEditingUser(null);
    setRoleFilter(role);
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const deleteUser = async () => {
    if (!deleteTarget) return;
    try {
      await adminService.deleteUser(deleteTarget, token);
      toast.success("Identity Removed.");
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error("Operation Denied.");
    }
  };

  const resetUserPassword = async () => {
    if (!resetTarget) return;
    try {
      await adminService.resetUserPassword(resetTarget, token);
      toast.success("Security Key Reset.");
      setResetTarget(null);
    } catch (err) {
      toast.error("Reset Failed.");
    }
  };

  const monthlyData = useMemo(() =>
    (stats?.monthlyRegistrations || []).map((m) => ({
      month: m.month || "N/A",
      count: m.count || 0,
    })), [stats]);

  const exportUsersToCsv = async () => {
    try {
      const students = await adminService.getUsers("student", token);
      const teachers = await adminService.getUsers("teacher", token);
      const allUsers = [...(students || []), ...(teachers || [])];
      if (!allUsers.length) {
        toast.info("No data to deploy.");
        return;
      }
      const headers = ["Name", "ID", "Email", "Role"];
      const rows = [headers.join(",")];
      allUsers.forEach((u) => rows.push(`${u.name},${u.uniqueId},${u.email},${u.role}`));
      const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
      saveAs(blob, "institution_registry.csv");
    } catch (err) {
      toast.error("Export Protocol Failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 space-y-12 pb-24 relative overflow-hidden">
      {/* Background Watermark */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 text-[20vw] font-black text-gray-100/50 pointer-events-none select-none tracking-tighter uppercase whitespace-nowrap">
        CONTROL HUB
      </div>

      {/* Header Segment */}
      <header className="px-8 md:px-14 pt-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 relative z-10">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-accent-500"></div>
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">Institutional Overview</span>
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter leading-none text-primary-950">
              Admin <span className="text-gray-200">Suite.</span>
            </h1>
         </div>
         
         <button 
           onClick={exportUsersToCsv}
           className="px-8 py-5 rounded-2xl bg-white border border-gray-100 hover:bg-gray-50 transition-all flex items-center gap-4 group shadow-sm hover:shadow-md"
         >
            <span className="text-xs font-black uppercase tracking-widest text-primary-950">Export Data</span>
            <Download size={20} className="text-accent-500 group-hover:translate-y-1 transition-transform" />
         </button>
      </header>

      <div className="px-4 sm:px-8 md:px-14 space-y-12 relative z-10 w-full overflow-x-hidden box-border">
        {/* Bento-Style Metrics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Left Metrics (2x2 Column Block) */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            <KPI title="Students" value={stats.students} sub="Enrolled" icon={Users} color="text-accent-500" link="/admin/students" />
            <KPI title="Faculty" value={stats.teachers} sub="Active Mentors" icon={UserPlus} color="text-primary-900" link="/admin/teachers" />
            <KPI title="Dues" value={`₹${stats.pendingFees}`} sub="Awaiting Payment" icon={Download} color="text-red-500" link="/admin/admissions" />
            <KPI title="Hubs" value={stats.classes} sub="Structural Units" icon={Shield} color="text-accent-400" link="/admin/classes" />
          </div>

          {/* Right Hero Metric (Double-Height Feature) */}
          <div className="lg:row-span-1 lg:h-full">
            <KPI title="Gallery" value={stats.galleryCount} sub="Digital Assets" icon={Image} color="text-accent-500" link="/admin/gallery" isHero={true} />
          </div>
        </section>

        {/* Analytics & Actions */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Chart Segment */}
          <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 md:p-14 border border-gray-100 shadow-sm overflow-hidden group">
            <div className="flex justify-between items-center mb-12">
               <h3 className="text-2xl font-black tracking-tighter text-primary-950 uppercase italic">Velocity</h3>
               <div className="px-4 py-2 bg-gray-50 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100">Last 6 Months</div>
            </div>

            <div style={{ width: "100%", height: "300px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="reg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#cbd5e1', fontSize: 10, fontWeight: 900}} 
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)'}}
                    cursor={{stroke: '#10b981', strokeWidth: 1}}
                  />
                  <Area
                    type="step"
                    dataKey="count"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#reg)"
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rapid Deployment Segment */}
          <div className="bg-white p-10 md:p-14 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 relative overflow-hidden group">
            <h3 className="text-2xl font-black tracking-tighter relative z-10 select-none">Quick Actions.</h3>
            
            <div className="space-y-4">
              <button
                className="w-full py-6 rounded-2xl bg-primary-950 text-white flex items-center justify-center gap-4 transition-all hover:bg-accent-500 shadow-lg group/btn"
                onClick={() => handleAddUser("student")}
              >
                <Plus size={20} className="group-hover/btn:rotate-90 transition-transform" />
                <span className="text-xs font-black uppercase tracking-[0.3em]">Add Student</span>
              </button>

              <button
                className="w-full py-6 rounded-2xl bg-white border border-gray-100 text-primary-950 flex items-center justify-center gap-4 transition-all hover:bg-gray-50 group/btn"
                onClick={() => handleAddUser("teacher")}
              >
                <UserPlus size={20} className="text-accent-500" />
                <span className="text-xs font-black uppercase tracking-[0.3em]">Add Teacher</span>
              </button>
              
              <Link
                to="/admin/gallery"
                className="w-full py-6 rounded-2xl bg-white border border-gray-100 text-primary-950 flex items-center justify-center gap-4 transition-all hover:bg-gray-50 group/btn"
              >
                <Image size={20} className="text-accent-500" />
                <span className="text-xs font-black uppercase tracking-[0.3em]">Upload Gallery</span>
              </Link>

              <div className="pt-6 mt-6 border-t border-gray-100 text-center">
                 <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-loose">
                   Automated identity provision system for institutional personnel.
                 </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Registry */}
        <section className="bg-white rounded-[2.5rem] p-10 md:p-16 border border-gray-100 shadow-sm overflow-hidden">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
              <div className="space-y-1">
                 <h3 className="text-3xl font-black tracking-tighter text-primary-950 uppercase italic">{roleFilter} Registry</h3>
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Digital Personnel Archive</p>
              </div>
              <div className="flex items-center p-1 bg-gray-50 rounded-2xl border border-gray-100">
                <button
                  className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    roleFilter === "student" ? "bg-white text-accent-500 shadow-sm" : "text-gray-400 hover:text-primary-950"
                  }`}
                  onClick={() => setRoleFilter("student")}
                >
                  Scholars
                </button>
                <button
                  className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    roleFilter === "teacher" ? "bg-white text-accent-500 shadow-sm" : "text-gray-400 hover:text-primary-950"
                  }`}
                  onClick={() => setRoleFilter("teacher")}
                >
                  Faculty
                </button>
              </div>
           </div>

           <div className="overflow-x-auto">
             <table className="w-full border-separate border-spacing-y-4">
               <thead>
                 <tr className="text-left text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
                   <th className="px-8 pb-4">Identity</th>
                   <th className="px-8 pb-4">Institutional UUID</th>
                   <th className="px-8 pb-4">Digital Mail</th>
                   <th className="px-8 pb-4 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="space-y-2">
                 {loadingUsers ? (
                   <tr><td colSpan={4} className="py-20 text-center text-gray-400">Syncing...</td></tr>
                 ) : users.map((u) => (
                   <tr key={u._id} className="group hover:bg-gray-50 transition-all duration-300 rounded-2xl">
                     <td className="px-8 py-6 rounded-l-2xl border-y border-l border-transparent group-hover:border-gray-100">
                       <span className="font-black text-primary-950 tracking-tight">{u.name}</span>
                     </td>
                     <td className="px-8 py-6 border-y border-transparent group-hover:border-gray-100">
                       <span className="font-black text-[11px] text-accent-500 bg-accent-500/5 px-4 py-1.5 rounded-full uppercase tracking-widest italic">{u.uniqueId}</span>
                     </td>
                     <td className="px-8 py-6 border-y border-transparent group-hover:border-gray-100">
                       <span className="text-xs font-bold text-gray-500">{u.email}</span>
                     </td>
                     <td className="px-8 py-6 rounded-r-2xl text-right border-y border-r border-transparent group-hover:border-gray-100">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                           <button onClick={() => handleEditUser(u)} className="p-3 bg-white border border-gray-100 rounded-xl text-primary-950 hover:bg-primary-950 hover:text-white transition-all shadow-sm"><Edit2 size={14}/></button>
                           <button onClick={() => setResetTarget(u._id)} className="p-3 bg-white border border-gray-100 rounded-xl text-primary-950 hover:bg-accent-500 hover:text-white transition-all shadow-sm"><Key size={14}/></button>
                           <button onClick={() => setDeleteTarget(u._id)} className="p-3 bg-white border border-gray-100 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"><Trash2 size={14}/></button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </section>
      </div>

      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title={editingUser ? "Administrative Revision" : `Add New ${roleFilter === 'student' ? 'Student' : 'Teacher'}`}
        size="5xl"
      >
        <AddEditUserModal
          onClose={() => setShowUserModal(false)}
          onUserAddedOrUpdated={() => { fetchStats(); fetchUsers(); }}
          user={editingUser}
          role={roleFilter}
        />
      </Modal>

      <ConfirmModal 
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteUser}
        title="Archive Identity?"
        message="This will permanently nullify this user identity and its access rights."
        confirmText="Archive Identity"
      />

      <ConfirmModal 
        isOpen={!!resetTarget}
        onClose={() => setResetTarget(null)}
        onConfirm={resetUserPassword}
        title="Reset Security Key?"
        message="Are you sure you want to broadcast a new default security key to this user?"
        confirmText="Reset Key"
        isDestructive={false}
        icon={Key}
      />
    </div>
  );
};

export default AdminDashboard;
