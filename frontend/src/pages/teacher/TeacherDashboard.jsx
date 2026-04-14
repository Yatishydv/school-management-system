// frontend/src/pages/teacher/TeacherDashboard.jsx

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import teacherService from "../../api/teacherService";
import notificationService from "../../api/notificationService";
import { 
  User, 
  Mail, 
  Fingerprint, 
  BookOpen, 
  Activity, 
  Users, 
  Layers,
  Shield,
  Star,
  Clock,
  Calendar,
  ClipboardList,
  ChevronRight,
  MapPin,
  Phone,
  Trophy,
  Layout,
  Bell,
  MessageSquare,
  Instagram,
  Facebook,
  Twitter,
  Smartphone,
  Globe
} from "lucide-react";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/shared/Modal";

const TeacherDashboard = () => {
  const { user, token } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(user);
  const [subjects, setSubjects] = useState([]);
  const [dashStats, setDashStats] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [notices, setNotices] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Profile Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prof, subs, stats, tt, noticeData, notifyData] = await Promise.all([
          teacherService.getProfile(token),
          teacherService.getAssignedSubjects(token),
          teacherService.getDashboardSummary(token),
          teacherService.getTimetable(token),
          teacherService.getNotices(),
          notificationService.getMyNotifications(token)
        ]);
        setProfile(prof);
        setSubjects(subs);
        setDashStats(stats);
        setTimetable(tt);
        setNotices(noticeData || []);
        setNotifications(notifyData || []);
      } catch (err) {
        console.error("Failed to sync faculty telemetry", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  if (loading) return (
    <div className="p-10 animate-pulse text-emerald-600 font-black uppercase tracking-widest flex items-center justify-center h-screen">
      Synchronizing Faculty Hub...
    </div>
  );

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="min-h-screen bg-gray-50/20 pb-24 font-body text-primary-950 px-4 md:px-0">
      {/* ------------------------------------------------------------------ */}
      {/*                        HERO HEADER SECTION                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="px-4 md:px-14 pt-12">
        <div className="bg-emerald-600 rounded-[3rem] p-4 border border-emerald-500 shadow-sm overflow-hidden relative group">
           {/* Plain Solid Green Background */}
           <div className="absolute inset-0 bg-emerald-600 opacity-95 transition-all duration-700"></div>
           <div className="absolute top-0 right-0 w-[40%] h-full bg-white/5 -skew-x-12 translate-x-20"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:pt-14 md:pb-32 gap-12">
              <div className="space-y-6 flex-1 text-center md:text-left">
                 <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black uppercase tracking-[0.3em]">
                    <Shield size={14} className="text-white animate-pulse" />
                    <span>Certified Faculty Command</span>
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                    Welcome Back, <br />
                    <span className="text-emerald-100 italic">{(profile?.name || user?.name || "Professor")?.split(' ')[0]}!</span>
                 </h1>
                  <p className="text-[10px] font-bold text-emerald-50/80 uppercase tracking-[0.2em] max-w-md">
                     Orchestrating academic excellence across multiple corridors. Your lecture roster and digital assets are live.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
                     <Link to="/teacher/attendance" className="px-8 py-4 bg-white text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center">
                        Manage Attendance
                     </Link>
                     <Link to="/teacher/results" className="px-8 py-4 bg-emerald-700/50 text-white border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-md flex items-center justify-center">
                        Record Grades
                     </Link>
                  </div>
              </div>

              <div className="relative">
                 <div className="w-56 h-56 md:w-64 md:h-64 rounded-full border-[10px] border-white/20 relative overflow-hidden bg-white/10 backdrop-blur-sm shadow-2xl">
                    {(profile?.profileImage || user?.profileImage) ? (
                       <img 
                         src={`http://localhost:5005/${profile?.profileImage || user?.profileImage}`} 
                         alt={profile?.name || user?.name} 
                         className="w-full h-full object-cover" 
                         onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + (profile?.name || user?.name || "Teacher") + "&background=059669&color=fff"; }}
                       />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center">
                          <User size={80} className="text-white opacity-20" />
                       </div>
                    )}
                    {/* Decorative Rings */}
                    <div className="absolute inset-0 border-[1px] border-white/20 rounded-full scale-90 animate-ping-slow"></div>
                 </div>
                 
                 <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-4 z-20 whitespace-nowrap">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                       <Trophy size={20} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Impact Rating</p>
                       <p className="text-xl font-black text-emerald-600 leading-none tabular-nums">98.4%</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                        KPI & STATS ROW                           */}
      {/* ------------------------------------------------------------------ */}
      <section className="px-4 md:px-14 mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {[
          { label: "Active Classes", value: String(dashStats?.totalClasses || '0').padStart(2, '0'), icon: Layers, color: "bg-emerald-600", trend: "Strategic", path: "/teacher/classes" },
          { label: "Module Coverage", value: String(dashStats?.totalSubjects || '0').padStart(2, '0'), icon: BookOpen, color: "bg-teal-600", trend: "Full Scope", path: "/teacher/assignments" },
          { label: "Student Registry", value: String(dashStats?.totalStudents || '0').padStart(2, '0'), icon: Users, color: "bg-green-600", trend: "Impacted", path: "/teacher/classes" },
          { label: "Today's Agenda", value: String(dashStats?.todayLectures || '0').padStart(2, '0'), icon: Clock, color: "bg-emerald-500", trend: "Real-time", path: "/teacher/attendance" },
          { label: "Pending Evaluations", value: String(dashStats?.pendingGrades || '0').padStart(2, '0'), icon: ClipboardList, color: "bg-lime-600", trend: "Action", path: "/teacher/assignments" }
        ].map((stat, i) => (
          <Link key={i} to={stat.path} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6 hover:shadow-xl transition-all group block">
             <div className="flex justify-between items-center">
                <div className={`w-12 h-12 rounded-2xl ${stat.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                   <stat.icon size={20} />
                </div>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">{stat.trend}</span>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{stat.label}</p>
                <p className="text-3xl font-black text-emerald-950 tracking-tighter tabular-nums">{stat.value}</p>
             </div>
          </Link>
        ))}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                        MAIN CONTENT GRID                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="px-4 md:px-14 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile & Agenda Sidebar */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-10">
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-emerald-950 flex items-center gap-3">
                 Profile Overview <ChevronRight size={20} className="text-emerald-600" />
              </h3>

              <div className="space-y-8">
                <div className="space-y-2">
                   <div className="flex items-center gap-3 text-gray-400">
                      <Fingerprint size={16} className="text-emerald-600" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Unique ID</span>
                   </div>
                   <p className="text-sm font-black text-emerald-950 tabular-nums uppercase tracking-widest italic">{profile?.uniqueId || user?.uniqueId}</p>
                </div>

                <div className="space-y-2">
                   <div className="flex items-center gap-3 text-gray-400">
                      <Mail size={16} className="text-emerald-600" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Email Address</span>
                   </div>
                   <p className="text-sm font-black text-emerald-950 lowercase truncate">{profile?.email || user?.email}</p>
                </div>

                <div className="space-y-2">
                   <div className="flex items-center gap-3 text-gray-400">
                      <MapPin size={16} className="text-emerald-600" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Address</span>
                   </div>
                   <p className="text-sm font-black text-emerald-950 uppercase line-clamp-1">{profile?.address || 'Institutional Faculty Hub'}</p>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50">
                 <button 
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-full py-5 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                 >
                    Faculty Information
                 </button>
              </div>
           </div>

           {/* Today's Schedule Mini-Card */}
           <div className="bg-emerald-900 rounded-[2.5rem] p-10 text-white space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full translate-x-20 -translate-y-20 blur-[100px] group-hover:scale-125 transition-transform duration-1000"></div>
              <h4 className="text-lg font-black uppercase tracking-widest text-emerald-400 italic font-display">Today's Schedule</h4>
              <div className="space-y-4">
                 {timetable && timetable.filter(item => item.day === today).length > 0 ? (
                   timetable.filter(item => item.day === today).sort((a,b) => a.startTime.localeCompare(b.startTime)).map((session, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                       <div className="text-center min-w-[60px] border-r border-white/10 pr-4">
                          <p className="text-[10px] font-black text-emerald-400">{session.startTime}</p>
                       </div>
                       <div className="space-y-0.5">
                          <p className="text-xs font-black uppercase italic tracking-tighter truncate max-w-[150px]">{session.subject?.name}</p>
                          <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{session.className}</p>
                       </div>
                    </div>
                   ))
                 ) : (
                   <div className="py-8 text-center bg-white/5 rounded-2xl border border-white/10 border-dashed">
                      <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">No Sessions Slated Today</p>
                   </div>
                 )}
              </div>

              <Link to="/teacher/attendance" className="block w-full py-4 bg-white/10 hover:bg-white/20 text-center rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                 Full Weekly Roster
              </Link>
           </div>

           {/* Incoming Alerts (NEW) */}
           <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                    <MessageSquare size={24} />
                  </div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-emerald-950">Alert Hub</h3>
                </div>
              </div>
              <div className="space-y-4">
                {notifications.length > 0 ? notifications.slice(0, 3).map((note, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-gray-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all group cursor-pointer" onClick={() => navigate('/teacher/notifications')}>
                    <div className="flex items-center gap-2 mb-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                       <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{note.sender?.role || 'System'} Dispatch</p>
                    </div>
                    <h5 className="text-sm font-black text-emerald-950 group-hover:text-emerald-700 transition-colors uppercase italic truncate">{note.title}</h5>
                  </div>
                )) : (
                  <p className="text-center py-6 text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">Hub signals clear.</p>
                )}
              </div>
              <Link to="/teacher/notifications" className="block w-full py-4 text-center text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-800 transition-colors">Open Inbox</Link>
           </div>
        </div>

        {/* Subjects Matrix & notices */}
        <div className="lg:col-span-2 space-y-12">
            {/* Broadcast Matrix (Notices) (NEW) */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 space-y-8">
               <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Bell size={24} />
                     </div>
                     <h3 className="text-xl font-black uppercase italic tracking-tighter text-emerald-950 font-display">Broadcast Matrix</h3>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Global Archive</span>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notices.length > 0 ? notices.slice(0, 4).map((notice, i) => (
                    <div key={i} className="flex items-start gap-6 p-6 rounded-3xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group">
                       <div className="text-center min-w-[50px] space-y-1">
                          <p className="text-2xl font-black text-emerald-950 tracking-tighter leading-none">{new Date(notice.createdAt).getDate()}</p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{new Date(notice.createdAt).toLocaleString('default', { month: 'short' })}</p>
                       </div>
                       <div className="space-y-1 flex-1 overflow-hidden">
                          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 italic">{notice.role || 'General'} Announcement</p>
                          <h5 className="text-sm font-black text-emerald-950 group-hover:text-emerald-600 transition-all truncate uppercase italic tracking-tight">{notice.title}</h5>
                       </div>
                    </div>
                  )) : (
                    <p className="col-span-full text-center py-10 text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">Digital frequencies clear. No broadcasts available.</p>
                  )}
               </div>
            </div>

            <div className="flex items-center justify-between">
               <h2 className="text-4xl font-black uppercase italic tracking-tighter text-emerald-950">Academic Jurisdiction</h2>
               <div className="flex items-center gap-2">
                  <div className="w-8 h-px bg-gray-200"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Operational Matrix</span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {subjects.length > 0 ? subjects.map((subject, i) => (
                  <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 group hover:shadow-2xl transition-all duration-500">
                    <div className="flex justify-between items-start">
                       <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                          <BookOpen size={24} />
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-300 font-bold">Catalog Code</p>
                          <p className="text-xl font-black text-emerald-600 tabular-nums italic">{subject.code || 'N/A'}</p>
                       </div>
                    </div>
                    
                    <div className="space-y-2">
                       <h5 className="text-2xl font-black text-emerald-950 uppercase italic leading-none">{subject.name}</h5>
                       <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Jurisdiction: {subject.classId ? `${subject.classId.name}${subject.classId.stream !== 'General' ? ` (${subject.classId.stream})` : ''}` : "Unassigned"}
                       </p>
                    </div>

                    <div className="space-y-4">
                       <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                          <div 
                             className="h-full bg-emerald-600 rounded-full transition-all duration-1000 group-hover:bg-green-400" 
                             style={{ width: `85%` }} 
                          ></div>
                       </div>
                       <div className="flex justify-between items-center pt-2">
                         <button 
                          onClick={() => navigate('/teacher/assignments')}
                          className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:text-emerald-800 flex items-center gap-2 transition-colors"
                         >
                            Manage Curriculum <ChevronRight size={14} />
                         </button>
                         <div className="flex gap-2">
                           <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><Star size={14}/></div>
                           <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"><Layers size={14}/></div>
                         </div>
                       </div>
                    </div>
                  </div>
               )) : (
                 <div className="col-span-full py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-gray-300 shadow-sm">
                       <Layout size={32} />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Curriculum Pending Allocation</p>
                 </div>
               )}
            </div>
        </div>
      </section>

      {/* Profile Modal (Read Only) */}
      <Modal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        title="Faculty Data Sheet"
        size="4xl"
      >
        <div className="p-6 md:p-12 space-y-12 bg-white overscroll-contain">
           {/* Header / Identity Section */}
           <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="w-32 h-32 rounded-[2.5rem] border-8 border-emerald-50 relative group overflow-hidden shadow-2xl transition-transform hover:scale-105">
                 {(profile?.profileImage || user?.profileImage) ? (
                    <img 
                      src={`http://localhost:5005/${profile?.profileImage || user?.profileImage}`} 
                      alt={profile?.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + (profile?.name || user?.name) + "&background=059669&color=fff"; }}
                    />
                 ) : (
                    <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <User size={48} />
                    </div>
                 )}
                 <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="text-center md:text-left">
                 <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-2">Faculty Identification</p>
                 <h4 className="text-4xl font-black text-primary-950 uppercase italic leading-none font-display">{profile?.name}</h4>
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 italic">Professional Academician</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2 border-l border-gray-100">Senior Faculty Node</span>
                 </div>
              </div>
           </div>

           {/* Professional Bio */}
           {(profile?.bio || user?.bio) && (
             <div className="p-8 bg-gray-50 rounded-[2rem] border border-gray-100 italic text-primary-950/70 text-sm leading-relaxed relative">
                <div className="absolute top-4 left-4 text-emerald-200">
                   <MessageSquare size={24} />
                </div>
                <div className="pl-6">
                   "{profile?.bio || user?.bio}"
                </div>
             </div>
           )}

           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Professional data column */}
              <div className="space-y-8">
                 <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Professional Matrix</span>
                 </div>
                 <div className="grid grid-cols-1 gap-6">
                    {[
                      { label: "Unique Identifier", value: profile?.uniqueId, icon: Fingerprint },
                      { label: "Qualification", value: profile?.qualification || "Specified", icon: Star },
                      { label: "Work Experience", value: profile?.experience || "N/A", icon: Activity },
                      { label: "Identification (Aadhar)", value: profile?.aadharNumber || "Registered", icon: Shield },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                          <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                             <item.icon size={18} />
                          </div>
                          <div>
                             <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">{item.label}</p>
                             <p className="text-sm font-black text-primary-950 italic uppercase">{item.value}</p>
                          </div>
                      </div>
                    ))}
                 </div>

                 {/* Demographic Matrix */}
                 <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                    {[
                      { label: "Gender", value: profile?.gender || "Specified", icon: User },
                      { label: "Religion", value: profile?.religion || "N/A", icon: Star },
                      { label: "Category", value: profile?.category || "General", icon: Layers },
                      { label: "Contact Frequency", value: profile?.phone || "Private", icon: Phone, type: 'tel' },
                    ].map((item, i) => (
                      <div key={i} className="space-y-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">{item.label}</p>
                          {item.type === 'tel' && item.value !== 'Private' ? (
                            <a href={`tel:${item.value}`} className="text-xs font-black text-primary-950 hover:text-blue-600 transition-colors uppercase tabular-nums">
                               {item.value}
                            </a>
                          ) : (
                            <p className="text-xs font-black text-primary-950 uppercase">{item.value}</p>
                          )}
                      </div>
                    ))}
                 </div>
              </div>

              {/* Digital & Social connectivity column */}
              <div className="space-y-10">
                 <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Digital Channels</span>
                 </div>
                 
                 <div className="space-y-6">
                    <a 
                      href={`mailto:${profile?.email || user?.email}`}
                      className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:border-emerald-200 transition-all"
                    >
                       <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-emerald-600 shadow-sm transition-all">
                          <Mail size={18} />
                       </div>
                       <div className="flex-1 overflow-hidden">
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Mail Vector</p>
                          <p className="text-sm font-black text-primary-950 lowercase truncate group-hover:text-emerald-600 transition-colors">
                            {profile?.email || user?.email}
                          </p>
                       </div>
                    </a>
                    
                    <a 
                      href={`tel:${profile?.phone || profile?.secondaryPhone}`}
                      className="flex items-center gap-4 p-6 bg-gray-50 rounded-3xl border border-gray-100 group hover:border-emerald-200 transition-all"
                    >
                       <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-400 group-hover:text-emerald-600 shadow-sm transition-all">
                          <Smartphone size={18} />
                       </div>
                       <div className="flex-1">
                          <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Communication Terminal</p>
                          <p className="text-sm font-black text-primary-950 tabular-nums group-hover:text-emerald-600 transition-colors">
                            {profile?.phone || profile?.secondaryPhone || 'Private Line'}
                          </p>
                       </div>
                    </a>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {[
                      { icon: Instagram, label: "Instagram", link: profile?.socialLinks?.instagram, color: "hover:bg-pink-500 hover:text-white" },
                      { icon: Facebook, label: "Facebook", link: profile?.socialLinks?.facebook, color: "hover:bg-blue-600 hover:text-white" },
                      { icon: Twitter, label: "Twitter", link: profile?.socialLinks?.twitter, color: "hover:bg-primary-950 hover:text-white" }
                    ].map((app, i) => {
                      const getUrl = (val) => {
                        if (!val) return "#";
                        if (val.startsWith('http')) return val;
                        return `https://${val}`;
                      };

                      return (
                        <a 
                          key={i} 
                          href={getUrl(app.link)}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`overflow-hidden h-24 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center gap-2 transition-all p-2 ${app.link ? app.color : 'opacity-30 cursor-not-allowed grayscale'}`}
                          onClick={(e) => !app.link && e.preventDefault()}
                        >
                           <app.icon size={20} />
                           <span className="text-[8px] font-black uppercase tracking-widest">{app.label}</span>
                        </a>
                      );
                    })}
                 </div>
                 
                 <div className="p-8 bg-emerald-950 rounded-[2.5rem] text-white relative overflow-hidden group">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full translate-x-10 translate-y-10 blur-3xl"></div>
                    <div className="flex items-center gap-4 relative z-10">
                       <MapPin size={24} className="text-emerald-400" />
                       <div>
                          <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Institutional base</p>
                          <p className="text-sm font-medium leading-relaxed opacity-90 italic">{profile?.address || "Main Campus Cluster"}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-100">
                 <Shield size={14} className="animate-pulse" />
                 Immutable Data Node • Administrative Record
              </div>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="px-14 py-5 bg-emerald-600 text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-900/10 active:scale-95"
              >
                Close Faculty Sheet
              </button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherDashboard;
