import React, { useEffect, useState } from "react";
import useAuthStore from "../../stores/authStore";
import studentService from "../../api/studentService";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Hash, 
  BookOpen, 
  Fingerprint, 
  Clock, 
  Star, 
  TrendingUp,
  Layout,
  Wallet,
  Trophy,
  ChevronRight,
  Bell,
  Award,
  ClipboardList,
  Shield,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";
import Modal from "../../components/shared/Modal";

const StudentDashboard = () => {
  const { user, token } = useAuthStore();
  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);
  const [dashStats, setDashStats] = useState(null);
  const [timetable, setTimetable] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [notices, setNotices] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profileData, summaryData, timetableData, subjectsData, noticesData, resultsData, assignmentsData] = await Promise.all([
          studentService.getProfile(token),
          studentService.getDashboardSummary(token),
          studentService.getTimetable(token),
          studentService.getSubjects(token),
          studentService.getNotices(token),
          studentService.getRecentResults(token),
          studentService.getAssignments(token)
        ]);
        setProfile(profileData);
        setDashStats(summaryData);
        setTimetable(timetableData);
        setSubjects(subjectsData);
        setNotices(noticesData);
        setRecentResults(resultsData || []);
        setAllAssignments(assignmentsData || []);
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchDashboardData();
  }, [token]);

  if (loading) return (
    <div className="p-10 animate-pulse text-sky-400 font-black uppercase tracking-widest flex items-center justify-center h-screen">
      Waking up the Scholar Portal...
    </div>
  );

  return (
    <div className="min-h-screen bg-blue-50/20 pb-24 font-body relative overflow-hidden text-primary-950">
      {/* Vertical Editorial Watermark */}
      <div className="fixed right-[-5%] top-1/2 -translate-y-1/2 rotate-90 pointer-events-none select-none z-0 hidden lg:block">
        <h1 className="text-[18vh] font-black text-transparent uppercase tracking-tighter leading-none opacity-20" 
            style={{ WebkitTextStroke: '1px rgba(30, 58, 138, 0.15)' }}>
          SCHOLAR HUB
        </h1>
      </div>
      {/* ------------------------------------------------------------------ */}
      {/*                        HERO HEADER SECTION                        */}
      {/* ------------------------------------------------------------------ */}
      <section className="px-8 md:px-14 pt-12">
        <div className="bg-white rounded-[4rem] p-4 border border-gray-100 shadow-2xl overflow-hidden relative group">
           {/* Gradient Backdrop */}
           <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-400 opacity-95 transition-all duration-700 group-hover:scale-105"></div>
           <div className="absolute top-0 right-0 w-[50%] h-full bg-white/10 -skew-x-12 translate-x-20 blur-3xl"></div>
           
           <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:pt-14 md:pb-32 gap-12">
              <div className="space-y-6 flex-1 text-center md:text-left">
                 <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black uppercase tracking-[0.3em]">
                    <Star size={14} className="animate-spin-slow" />
                    <span>Academic Excellence Hub</span>
                 </div>
                 <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                    Welcome Back, <br />
                    <span className="text-blue-100 italic">{(profile?.name || user?.name || "Scholar")?.split(' ')[0]}!</span>
                 </h1>
                  <p className="text-[10px] font-bold text-blue-100/60 uppercase tracking-[0.2em] max-w-md">
                     Your academic journey is in full bloom. Explore your modules, track your attendance, and reach for the stars.
                  </p>
                  <div className="flex flex-wrap gap-4 pt-4 justify-center md:justify-start">
                     <Link to="/student/timetable" className="px-8 py-4 bg-white text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center">
                        View Timetable
                     </Link>
                     <Link to="/student/subjects" className="px-8 py-4 bg-blue-700/50 text-white border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-md flex items-center justify-center">
                        Resources
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
                         onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=" + (profile?.name || user?.name || "Student") + "&background=1e40af&color=fff"; }}
                       />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center">
                          <User size={80} className="text-white opacity-40" />
                       </div>
                    )}
                    {/* Decorative Rings */}
                    <div className="absolute inset-0 border-[1px] border-white/40 rounded-full scale-90 animate-ping-slow"></div>
                 </div>
                 <div className="absolute -bottom-12 -right-8 bg-white/80 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-2xl border border-white/50 flex items-center gap-5 z-20 whitespace-nowrap animate-fade-up">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                      (dashStats?.percentile <= 10) ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/20' : 
                      (dashStats?.percentile <= 30) ? 'bg-gradient-to-br from-slate-300 to-slate-500 shadow-slate-500/20' :
                      (dashStats?.percentile <= 50) ? 'bg-gradient-to-br from-orange-300 to-orange-700 shadow-orange-700/20' :
                      'bg-gradient-to-br from-blue-400 to-blue-600 shadow-blue-600/20'
                    }`}>
                       <Trophy size={28} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Class Rank</p>
                       <p className="text-2xl font-black text-primary-950 leading-none">
                          Rank #{dashStats?.rank || '—'} <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest leading-none block mt-1">out of {dashStats?.totalStudents || '—'} Scholars</span>
                       </p>
                       <p className={`text-[9px] font-bold uppercase tracking-widest mt-1 ${
                          (dashStats?.percentile <= 10) ? 'text-amber-600' : 
                          (dashStats?.percentile <= 30) ? 'text-slate-500' :
                          (dashStats?.percentile <= 50) ? 'text-orange-700' :
                          'text-blue-600'
                       }`}>
                          {dashStats?.percentile <= 10 ? 'Elite Gold' : 
                           dashStats?.percentile <= 30 ? 'Elite Silver' :
                           dashStats?.percentile <= 50 ? 'Elite Bronze' :
                           'Global Tier'}
                       </p>
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
          { label: "Overall Attendance", value: `${dashStats?.attendance || '0'}%`, icon: Clock, color: "bg-blue-500", trend: "+2.1%", path: "/student/attendance" },
          { label: "Academic GPA", value: `${dashStats?.gpa || '0.0'}/4.0`, icon: TrendingUp, color: "bg-sky-500", trend: "Latest", path: "/student/results" },
          { label: "Assignments Due", value: String(dashStats?.pendingAssignments || '0').padStart(2, '0'), icon: BookOpen, color: "bg-indigo-500", trend: "Action Required", path: "/student/assignments" },
          { label: "Outstanding Dues", value: `₹${(dashStats?.totalDues || 0).toLocaleString()}`, icon: Wallet, color: "bg-red-500", trend: "Awaiting", path: "/student/fees" },
          { label: "Institutional Roll", value: `#${profile?.rollNumber || user?.rollNumber || '—'}`, icon: Hash, color: "bg-blue-900", trend: "Verified", path: "#" }
        ].map((stat, i) => (
          <Link key={i} to={stat.path} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm space-y-6 hover:shadow-xl transition-all group">
             <div className="flex justify-between items-center">
                <div className={`w-12 h-12 rounded-2xl ${stat.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                   <stat.icon size={20} />
                </div>
                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">{stat.trend}</span>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{stat.label}</p>
                <p className="text-3xl font-black text-primary-950 tracking-tighter tabular-nums">{stat.value}</p>
             </div>
          </Link>
        ))}
      </section>

      {/* ------------------------------------------------------------------ */}
      {/*                        MAIN CONTENT GRID                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="px-8 md:px-14 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Profile Details (Redesigned) */}
        <div className="lg:col-span-1 space-y-8">
           <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm space-y-10">
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-primary-950 flex items-center gap-3">
                 Profile Overview <ChevronRight size={20} className="text-blue-500" />
              </h3>

              <div className="space-y-8">
                <div className="space-y-2">
                   <div className="flex items-center gap-3 text-gray-400">
                      <Fingerprint size={16} className="text-blue-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Unique ID</span>
                   </div>
                   <p className="text-sm font-black text-primary-950 tabular-nums uppercase tracking-widest">{profile?.uniqueId || user?.uniqueId}</p>
                </div>

                <div className="space-y-2">
                   <div className="flex items-center gap-3 text-gray-400">
                      <GraduationCap size={16} className="text-blue-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Class</span>
                   </div>
                   <p className="text-sm font-black text-primary-950 uppercase">{profile?.classId ? `${profile.classId.name}${profile.classId.stream !== 'General' ? ` (${profile.classId.stream})` : ''}` : "Allocating..."}</p>
                </div>

                <div className="space-y-2">
                   <div className="flex items-center gap-3 text-gray-400">
                      <Mail size={16} className="text-blue-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Email Address</span>
                   </div>
                   <p className="text-sm font-black text-primary-950 lowercase truncate">{profile?.email || user?.email}</p>
                </div>

                <div className="space-y-2">
                   <div className="flex items-center gap-3 text-gray-400">
                      <MapPin size={16} className="text-blue-500" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Address</span>
                   </div>
                   <p className="text-sm font-black text-primary-950 uppercase line-clamp-1">{profile?.address || user?.address || 'N/A'}</p>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50">
                 <button 
                   onClick={() => setIsProfileModalOpen(true)}
                   className="w-full py-5 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                 >
                    Student Information
                 </button>
              </div>
           </div>

            <div className="bg-primary-950 rounded-[2.5rem] p-10 text-white space-y-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full translate-x-20 -translate-y-20 blur-[100px] group-hover:scale-125 transition-transform duration-1000"></div>
               <h4 className="text-lg font-black uppercase tracking-widest text-blue-400 italic">Today's Schedule</h4>
               <div className="space-y-4">
                  {timetable.length > 0 ? timetable.filter(item => item.day === new Date().toLocaleDateString('en-US', { weekday: 'long' })).sort((a,b) => a.startTime.localeCompare(b.startTime)).map((session, i) => {
                    const now = new Date();
                    const currentHours = now.getHours();
                    const currentMinutes = now.getMinutes();
                    const [startH, startM] = session.startTime.split(':').map(Number);
                    const [endH, endM] = session.endTime.split(':').map(Number);
                    const isLive = (currentHours > startH || (currentHours === startH && currentMinutes >= startM)) && 
                                   (currentHours < endH || (currentHours === endH && currentMinutes < endM));
                    
                    return (
                      <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-500 ${isLive ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10 scale-[1.02]' : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'}`}>
                         <div className="text-center min-w-[60px] border-r border-white/10 pr-4">
                            <p className={`text-[10px] font-black ${isLive ? 'text-blue-200' : 'text-blue-400'}`}>{session.startTime}</p>
                            {isLive && <span className="text-[8px] font-black text-blue-400 animate-pulse block">LIVE</span>}
                         </div>
                         <div className="space-y-0.5">
                            <p className="text-xs font-black uppercase italic tracking-tighter">{session.subject?.name}</p>
                            <p className={`text-[9px] font-bold uppercase transition-colors ${isLive ? 'text-blue-300' : 'text-white/40'}`}>{session.subject?.assignedTeachers?.[0]?.name || 'Institutional Staff'}</p>
                         </div>
                      </div>
                    );
                  }) : (
                    <div className="py-8 text-center bg-white/5 rounded-2xl border border-white/10 border-dashed">
                       <p className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em]">No Sessions Slated Today</p>
                    </div>
                  )}
               </div>

               <Link to="/student/timetable" className="block w-full py-4 bg-white/10 hover:bg-white/20 text-center rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">
                  Full Weekly Roster
               </Link>
            </div>
        </div>

        {/* Learning Journey / Recent Lessons */}
        <div className="lg:col-span-2 space-y-12">
            {/* Announcements Section */}
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 space-y-8">
               <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Bell size={24} />
                     </div>
                     <h3 className="text-xl font-black uppercase italic tracking-tighter text-primary-950">Broadcast Matrix</h3>
                  </div>
                  <Link to="/student/notifications" className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-800 transition-colors">View All Archive</Link>
               </div>
               <div className="space-y-4">
                  {notices.length > 0 ? notices.slice(0, 3).map((notice, i) => (
                    <div key={i} className="flex items-start gap-6 p-6 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group">
                       <div className="text-center min-w-[50px] space-y-1">
                          <p className="text-xs font-black text-primary-950">{new Date(notice.createdAt).getDate()}</p>
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{new Date(notice.createdAt).toLocaleString('default', { month: 'short' })}</p>
                       </div>
                       <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                             <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                             <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">{notice.sender?.role || 'Admin'} Dispatch</p>
                          </div>
                          <h5 className="text-sm font-bold text-primary-950 group-hover:text-blue-600 transition-colors">{notice.title}</h5>
                       </div>
                    </div>
                  )) : (
                    <p className="text-center py-10 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Digital frequencies clear. No broadcasts available.</p>
                  )}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               {/* Upcoming Assignments */}
               <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                           <ClipboardList size={24} />
                        </div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-primary-950">Submissions Queue</h3>
                     </div>
                  </div>
                  <div className="space-y-6">
                     {allAssignments.filter(a => a.status === 'Pending').slice(0, 2).map((asm, i) => (
                       <Link to="/student/assignments" key={i} className="block p-6 rounded-2xl bg-gray-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all group">
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">{asm.subject?.name}</span>
                             <span className="text-[9px] font-black uppercase text-red-500 italic">Deadline Due</span>
                          </div>
                          <h6 className="text-sm font-black text-primary-950 group-hover:text-indigo-600 transition-colors uppercase italic">{asm.title}</h6>
                       </Link>
                     ))}
                     {allAssignments.filter(a => a.status === 'Pending').length === 0 && (
                       <p className="text-center py-6 text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">All performance tasks are current.</p>
                     )}
                  </div>
               </div>

               {/* Recent Results */}
               <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm p-10 space-y-8">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                           <Award size={24} />
                        </div>
                        <h3 className="text-xl font-black uppercase italic tracking-tighter text-primary-950">Rank Metrics</h3>
                     </div>
                  </div>
                  <div className="space-y-6">
                     {recentResults.slice(0, 2).map((res, i) => (
                       <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-gray-50 border border-transparent group">
                          <div>
                             <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1">{res.subjectId?.name || 'Academic Unit'}</p>
                             <p className="text-sm font-black text-primary-950 italic">{res.marksObtained}/{res.totalMarks}</p>
                          </div>
                          <div className={`px-4 py-2 bg-white rounded-xl text-xs font-black uppercase italic border border-gray-100 ${res.marksObtained/res.totalMarks >= 0.75 ? 'text-emerald-500' : 'text-blue-500'}`}>
                             {res.grade || 'A'}
                          </div>
                       </div>
                     ))}
                     {recentResults.length === 0 && (
                       <p className="text-center py-6 text-[10px] font-bold text-gray-300 uppercase tracking-widest italic">Cycle evaluations pending.</p>
                     )}
                  </div>
               </div>
            </div>

            <div className="space-y-12">
                <div className="flex items-center justify-between">
                   <h2 className="text-4xl font-black uppercase italic tracking-tighter text-primary-950">Learning Matrix</h2>
                   <div className="flex items-center gap-2">
                      <div className="w-8 h-px bg-gray-200"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Fall Semester 24</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {subjects.length > 0 ? subjects.map((subject, i) => (
                      <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 group hover:shadow-2xl transition-all duration-500">
                        <div className="flex justify-between items-start">
                           <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              <BookOpen size={24} />
                           </div>
                           <div className="text-right">
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Subject Code</p>
                              <p className="text-xl font-black text-blue-600 tabular-nums">{subject.code || 'N/A'}</p>
                           </div>
                        </div>
                        
                        <div className="space-y-2">
                           <h5 className="text-2xl font-black text-primary-950 uppercase italic leading-none">{subject.name}</h5>
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                               Instructors: {subject.assignedTeachers?.map(t => t.name).join(', ') || 'Staff Allocated'}
                           </p>
                        </div>

                        <div className="space-y-4">
                           <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                              <div 
                                 className="h-full bg-blue-600 rounded-full transition-all duration-1000 group-hover:bg-sky-400" 
                                 style={{ width: `75%` }} 
                              ></div>
                           </div>
                           <Link to="/student/subjects" className="w-full py-4 text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 hover:text-blue-800 flex items-center justify-center gap-2 transition-colors">
                               View Module Content <ChevronRight size={14} />
                           </Link>
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
        </div>
      </section>

      {/* Profile Modal (Read Only) */}
      <Modal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        title="Scholar Data Sheet"
      >
        <div className="p-10 space-y-12">
           <div className="flex items-center gap-8">
              <div className="w-24 h-24 rounded-[2rem] border-4 border-blue-500/20 overflow-hidden shadow-xl">
                {(profile?.profileImage || user?.profileImage) ? (
                    <img 
                      src={`http://localhost:5005/${profile?.profileImage || user?.profileImage}`} 
                      alt={profile?.name} 
                      className="w-full h-full object-cover" 
                    />
                ) : (
                    <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <User size={40} />
                    </div>
                )}
              </div>
              <div>
                 <h4 className="text-3xl font-black text-primary-950 uppercase italic leading-none">{profile?.name}</h4>
                 <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-2 bg-blue-50 px-3 py-1 rounded-full inline-block">Registered Scholar</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[
                { label: "Unique Identifier", value: profile?.uniqueId, icon: Fingerprint },
                { label: "Institutional Roll", value: profile?.rollNumber, icon: Hash },
                { label: "Allocated Class", value: profile?.classId ? `${profile.classId.name} (${profile.classId.stream})` : "N/A", icon: GraduationCap },
                { label: "Digital Mail", value: profile?.email, icon: Mail },
                { label: "Mobile Frequency", value: profile?.phone || "+91-XXXXXXXXXX", icon: Phone },
                { label: "Institutional Base", value: profile?.address || "Main Campus Cluster", icon: MapPin },
                { label: "Guardian Contact", value: profile?.guardianName || "N/A", icon: User },
                { label: "Admission date", value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "N/A", icon: Calendar }
              ].map((item, i) => (
                <div key={i} className="space-y-3 p-6 bg-gray-50 rounded-[1.5rem] border border-gray-100 hover:border-blue-200 transition-colors group">
                    <div className="flex items-center gap-3 text-gray-400 group-hover:text-blue-600 transition-colors">
                      <item.icon size={16} />
                      <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                    </div>
                    <p className="text-sm font-black text-primary-950 italic uppercase tracking-tight">{item.value}</p>
                </div>
              ))}
           </div>

           <div className="pt-10 border-t border-gray-100 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-100">
                 <Shield size={14} />
                 Read-Only Scholar Record
              </div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Contact the Central Archive (Admin) for credential modification.</p>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                className="mt-4 px-12 py-5 bg-primary-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-primary-950/20"
              >
                Close Record
              </button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentDashboard;

const GraduationCap = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c3 3 9 3 12 0v-5" />
  </svg>
);
