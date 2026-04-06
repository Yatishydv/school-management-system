// frontend/src/pages/teacher/TeacherDashboard.jsx

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "../../stores/authStore";
import teacherService from "../../api/teacherService";
import { 
  User, 
  Mail, 
  Fingerprint, 
  BookOpen, 
  Activity, 
  Users, 
  ExternalLink,
  Layers,
  Shield,
  Star,
  Clock,
  Calendar,
  ClipboardList,
  ChevronRight,
  TrendingUp,
  MapPin,
  Trophy,
  Layout,
  Hash
} from "lucide-react";
import Spinner from "../../components/ui/Spinner";

const TeacherDashboard = () => {
  const { user, token } = useAuthStore();
  const [profile, setProfile] = useState(user);
  const [subjects, setSubjects] = useState([]);
  const [dashStats, setDashStats] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prof, subs, stats, tt] = await Promise.all([
          teacherService.getProfile(token),
          teacherService.getAssignedSubjects(token),
          teacherService.getDashboardSummary(token),
          teacherService.getTimetable(token)
        ]);
        setProfile(prof);
        setSubjects(subs);
        setDashStats(stats);
        setTimetable(tt);
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
    <div className="min-h-screen bg-gray-50/20 pb-24 font-body">
      {/* ------------------------------------------------------------------ */}
      {/*                        HERO HEADER SECTION                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="px-8 md:px-14 pt-12">
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
      <section className="px-8 md:px-14 mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {[
          { label: "Active Classes", value: String(dashStats?.totalClasses || '0').padStart(2, '0'), icon: Layers, color: "bg-emerald-600", trend: "Strategic" },
          { label: "Module Coverage", value: String(dashStats?.totalSubjects || '0').padStart(2, '0'), icon: BookOpen, color: "bg-teal-600", trend: "Full Scope" },
          { label: "Student Registry", value: String(dashStats?.totalStudents || '0').padStart(2, '0'), icon: Users, color: "bg-green-600", trend: "Impacted" },
          { label: "Today's Agenda", value: String(dashStats?.todayLectures || '0').padStart(2, '0'), icon: Clock, color: "bg-emerald-500", trend: "Real-time" },
          { label: "Pending Evaluations", value: String(dashStats?.pendingGrades || '0').padStart(2, '0'), icon: ClipboardList, color: "bg-lime-600", trend: "Action" }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6 hover:shadow-xl transition-all group">
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
          </div>
        ))}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                        MAIN CONTENT GRID                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="px-8 md:px-14 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
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
                 <button className="w-full py-5 bg-emerald-50 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                    Update Registry Details
                 </button>
              </div>
           </div>

           <div className="bg-emerald-950 rounded-[2.5rem] p-10 text-white space-y-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/20 rounded-full translate-x-20 -translate-y-20 blur-[100px] group-hover:scale-125 transition-transform duration-1000"></div>
              <h4 className="text-lg font-black uppercase tracking-widest text-emerald-500 italic">Today's Schedule</h4>
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
        </div>

        {/* Subjects Matrix */}
        <div className="lg:col-span-2 space-y-12">
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
                         <button className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:text-emerald-800 flex items-center gap-2 transition-colors">
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
    </div>
  );
};

export default TeacherDashboard;
