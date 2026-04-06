// frontend/src/pages/student/StudentTimetable.jsx

import React, { useEffect, useState } from "react";
import useAuthStore from "../../stores/authStore";
import studentService from "../../api/studentService";
import { Clock, Calendar, BookOpen, User, ChevronLeft, ArrowRight, Layers, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/ui/Spinner";

const StudentTimetable = () => {
  const { token } = useAuthStore();
  const navigate = useNavigate();
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const data = await studentService.getTimetable(token);
        setTimetable(data || []);
      } catch (err) {
        console.error("Failed to fetch timetable", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchTimetable();
  }, [token]);

  const filteredSchedule = timetable.filter(item => item.day === activeDay);

  if (loading) return <div className="p-20 flex items-center justify-center min-h-screen animate-pulse"><Spinner size="xl" /></div>;

  return (
    <div className="min-h-screen bg-gray-50/20 pb-40 relative overflow-hidden font-body">
      {/* Watermark Decoration */}
      <div className="absolute top-20 right-[-10%] text-[20vw] font-black text-blue-950/[0.03] pointer-events-none select-none tracking-tighter uppercase whitespace-nowrap rotate-12">
        SCHEDULE
      </div>

      <div className="px-8 md:px-14 pt-16 relative z-10 space-y-16">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
           <div className="space-y-6">
              <button 
                onClick={() => navigate(-1)}
                className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 hover:text-blue-800 transition-all"
              >
                <div className="p-2 bg-blue-50 rounded-lg group-hover:-translate-x-1 transition-transform">
                  <ChevronLeft size={16} />
                </div> 
                Back to Dashboard
              </button>
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-px bg-blue-600"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600 opacity-60">Academic Rhythm</span>
                 </div>
                 <h1 className="text-5xl md:text-8xl font-black text-blue-950 tracking-tighter uppercase italic leading-none">
                   Weekly <span className="text-gray-200">Chronicle.</span>
                 </h1>
              </div>
           </div>
           
           <div className="bg-white p-3 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-gray-100 grid grid-cols-3 sm:grid-cols-6 gap-3 w-full max-w-2xl transform hover:scale-105 transition-transform duration-700">
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`px-4 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all italic ${activeDay === day ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/30 active:scale-95' : 'text-gray-400 hover:bg-blue-50 hover:text-blue-600'}`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
           </div>
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 gap-8">
          {filteredSchedule.length > 0 ? (
            filteredSchedule.sort((a,b) => a.startTime.localeCompare(b.startTime)).map((session, i) => (
              <div key={i} className="group bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-0 bg-blue-600 group-hover:h-full transition-all duration-500"></div>
                
                {/* Time Indicator */}
                <div className="flex flex-col items-center justify-center min-w-[160px] space-y-4 relative z-10">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:scale-110 duration-500 shadow-xl shadow-blue-900/5">
                      <Clock size={28} />
                   </div>
                   <div className="text-center space-y-1">
                      <p className="text-xl font-black text-blue-950 tabular-nums italic tracking-tighter">{session.startTime}</p>
                      <div className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-100 group-hover:bg-blue-50 transition-all">
                        <p className="text-[9px] font-bold text-gray-300 group-hover:text-blue-400 uppercase tracking-widest tabular-nums">Duration Node → {session.endTime}</p>
                      </div>
                   </div>
                </div>

                {/* Subject Identity */}
                <div className="flex-1 space-y-4 text-center md:text-left relative z-10">
                   <div className="flex items-center justify-center md:justify-start gap-4">
                      <div className="px-4 py-1.5 rounded-full bg-blue-50/50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-50 transition-all group-hover:bg-white group-hover:border-transparent italic">
                        Node Identity: {session.subject?.code || 'CURR-X'}
                      </div>
                   </div>
                   <h3 className="text-3xl md:text-5xl font-black text-blue-950 uppercase italic tracking-tighter leading-none group-hover:translate-x-4 transition-transform duration-500">
                     {session.subject?.name || 'Academic Colloquium'}
                   </h3>
                   <p className="text-[10px] font-medium text-gray-300 uppercase tracking-widest max-w-sm">Synchronized classroom resource session scheduled for current day.</p>
                </div>

                {/* Staff Lead */}
                <div className="flex items-center gap-6 bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100 min-w-[280px] group-hover:bg-blue-50/50 transition-all relative overflow-hidden group/staff">
                   <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 opacity-10 group-hover/staff:rotate-45 transition-transform"></div>
                   <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-gray-100 flex items-center justify-center text-blue-600 shadow-sm group-hover:rotate-12 transition-all">
                      <User size={32} />
                   </div>
                   <div className="space-y-1 text-left relative z-10">
                      <p className="text-[11px] font-black uppercase tracking-widest text-gray-300 italic group-hover:text-blue-400">Faculty Expert</p>
                      <p className="text-xl font-black text-blue-950 uppercase tracking-tighter leading-none">
                        {session.teacher?.name || session.subject?.assignedTeachers?.[0]?.name || 'Departmental Staff'}
                      </p>
                   </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-48 bg-white rounded-[4rem] border border-dashed border-gray-100 flex flex-col items-center justify-center text-center space-y-8 shadow-sm">
               <div className="w-24 h-24 rounded-[3rem] bg-gray-50 flex items-center justify-center text-gray-100 animate-pulse">
                  <Activity size={56} />
               </div>
               <div className="space-y-3">
                  <p className="text-2xl font-black text-blue-950 uppercase italic tracking-tighter">Academic Repose Identified</p>
                  <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest max-w-xs mx-auto leading-loose italic">No institutional curricula or classroom sessions identified for this temporal node.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentTimetable;
