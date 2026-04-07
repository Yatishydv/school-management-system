import React, { useEffect, useState } from "react";
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Save, 
  Search,
  BookOpen,
  MapPin,
  ChevronRight,
  Shield,
  Activity,
  Edit3,
  X,
  CheckCircle,
  Zap,
  ArrowRight
} from "lucide-react";
import adminService from "../../api/adminService";
import useAuthStore from "../../stores/authStore";
import { toast } from "react-toastify";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/shared/Modal";

const AdminTimetable = () => {
    const { token } = useAuthStore();
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [subjects, setSubjects] = useState([]);
    const [timetable, setTimetable] = useState({ schedule: [] });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeDay, setActiveDay] = useState("Monday");
    
    // Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null); // { index, data }
    const [slotFormData, setSlotFormData] = useState({
        subject: "",
        teacher: "",
        startTime: "09:00",
        endTime: "10:00",
        room: "Room 101"
    });

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const res = await adminService.getClasses(token);
                setClasses(res || []);
            } catch (err) {
                toast.error("Failed to sync structural nodes.");
            }
        };
        if (token) fetchInitialData();
    }, [token]);

    useEffect(() => {
        if (selectedClassId) {
            const fetchClassSpecificData = async () => {
                setLoading(true);
                try {
                    const [ttRes, subRes] = await Promise.all([
                        adminService.getTimetable(selectedClassId, token),
                        adminService.getSubjects(token)
                    ]);
                    setTimetable(ttRes || { schedule: [] });
                    setSubjects((subRes || []).filter(s => s.classId?._id === selectedClassId || s.classId === selectedClassId));
                } catch (err) {
                    toast.error("Telemetry fetch failed.");
                } finally {
                    setLoading(false);
                }
            };
            fetchClassSpecificData();
        } else {
            setTimetable({ schedule: [] });
            setSubjects([]);
        }
    }, [selectedClassId, token]);

    const handleOpenAddModal = () => {
        setEditingSlot(null);
        setSlotFormData({
            subject: "",
            teacher: "",
            startTime: "09:00",
            endTime: "10:00",
            room: "Room 101"
        });
        setIsEditModalOpen(true);
    };

    const handleOpenEditModal = (slot, index) => {
        setEditingSlot({ index, data: slot });
        setSlotFormData({
            subject: slot.subject?._id || slot.subject,
            teacher: slot.teacher?._id || slot.teacher || "",
            startTime: slot.startTime,
            endTime: slot.endTime,
            room: slot.room
        });
        setIsEditModalOpen(true);
    };

    const handleSaveSlot = (e) => {
        e.preventDefault();
        if (!slotFormData.subject) return toast.error("Subject unit required.");

        const newSchedule = [...timetable.schedule];
        const slotData = { ...slotFormData, day: activeDay };

        if (editingSlot !== null) {
            newSchedule[editingSlot.index] = slotData;
        } else {
            newSchedule.push(slotData);
        }

        setTimetable({ ...timetable, schedule: newSchedule });
        setIsEditModalOpen(false);
    };

    const handleRemoveSlot = (index) => {
        setTimetable(prev => ({
            ...prev,
            schedule: prev.schedule.filter((_, i) => i !== index)
        }));
    };

    const handleSaveTimetable = async () => {
        if (!selectedClassId) return toast.warning("Select a target node.");
        
        setSaving(true);
        try {
            const schedulePayload = timetable.schedule.map(s => ({
                day: s.day,
                subject: s.subject?._id || s.subject,
                teacher: s.teacher?._id || s.teacher || null,
                startTime: s.startTime,
                endTime: s.endTime,
                room: s.room
            }));

            await adminService.manageTimetable({
                classId: selectedClassId,
                schedule: schedulePayload
            }, token);
            toast.success("Timetable Instated.");
        } catch (err) {
            toast.error("Protocol violation during save.");
        } finally {
            setSaving(false);
        }
    };

    const filteredSchedule = timetable.schedule
        .filter(s => s.day === activeDay)
        .sort((a,b) => a.startTime.localeCompare(b.startTime));

    return (
        <div className="min-h-screen bg-[#fafafa] pb-40 relative overflow-hidden">
            {/* Decal */}
            <div className="absolute top-20 right-[-10%] text-[20vw] font-black text-gray-100/50 pointer-events-none select-none tracking-tighter uppercase whitespace-nowrap rotate-90">
                CHRONICLE
            </div>

            <header className="px-8 md:px-14 pt-16 relative z-10 space-y-12 mb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-accent-500 animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Institutional Rhythm Hub</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-primary-950 tracking-tighter uppercase italic leading-none">
                            Matrix <span className="text-gray-200">Editor.</span>
                        </h1>
                    </div>

                    <div className="w-full md:w-auto">
                        <select
                            className="w-full md:w-72 px-8 py-6 bg-white border border-gray-100 rounded-3xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-accent-50 shadow-xl"
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                        >
                            <option value="">Select Target Node (Class)</option>
                            {classes.map(c => <option key={c._id} value={c._id}>{c.name}{c.stream !== 'General' ? ` (${c.stream})` : ''}</option>)}
                        </select>
                    </div>
                </div>
                
                {/* Day Tabs */}
                <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
                    {days.map(day => (
                        <button
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={`px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                                activeDay === day 
                                ? "bg-primary-950 text-white border-primary-950 shadow-xl shadow-primary-950/20 translate-y-[-4px]" 
                                : "bg-white text-gray-400 border-gray-100 hover:border-accent-500 hover:text-accent-500"
                            }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </header>

            <div className="px-8 md:px-14 relative z-10">
                {!selectedClassId ? (
                    <div className="py-40 bg-white rounded-[4rem] border border-dashed border-gray-100 flex flex-col items-center justify-center text-center gap-6 animate-fade-in shadow-sm">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-gray-50 flex items-center justify-center text-gray-200">
                             <Zap size={40} />
                        </div>
                        <div className="space-y-2">
                             <h3 className="text-xl font-black text-primary-950 uppercase italic tracking-tighter">Awaiting Deployment</h3>
                             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select a class axis to begin temporal sequencing</p>
                        </div>
                    </div>
                ) : loading ? (
                    <div className="py-40 flex flex-col items-center justify-center gap-6">
                        <Spinner size="xl" />
                        <span className="text-[10px] font-black uppercase tracking-[1em] text-gray-300 animate-pulse">Syncing Matrix</span>
                    </div>
                ) : (
                    <div className="space-y-8 animate-fade-in">
                        {/* Day View */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl font-black text-primary-950 uppercase italic tracking-tight">{activeDay}</div>
                                <div className="px-4 py-1.5 bg-accent-50 text-accent-600 rounded-full text-[8px] font-black uppercase tracking-widest border border-accent-100">
                                    {filteredSchedule.length} Nodes Sloted
                                </div>
                            </div>
                            <button 
                                onClick={handleOpenAddModal}
                                className="flex items-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-2xl text-[9px] font-black uppercase tracking-widest text-primary-950 hover:bg-accent-500 hover:text-white transition-all shadow-sm hover:shadow-xl"
                            >
                                <Plus size={16} />
                                Append Slot
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {filteredSchedule.length > 0 ? (
                                filteredSchedule.map((slot, idx) => {
                                    const originalIndex = timetable.schedule.indexOf(slot);
                                    const slotSubject = slot.subject?.name || subjects.find(s => s._id === slot.subject || s._id === slot.subject?._id)?.name || "Unknown Unit";
                                    const slotTeacher = slot.teacher?.name || subjects.find(s => s._id === slot.subject || s._id === slot.subject?._id)?.assignedTeachers?.find(t => t._id === slot.teacher || t._id === slot.teacher?._id)?.name || "Unassigned";

                                    return (
                                        <div key={idx} className="group relative bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row items-center gap-8">
                                            <div className="absolute top-0 left-0 w-2 h-full bg-accent-500 rounded-l-full group-hover:w-3 transition-all"></div>
                                            
                                            {/* Time Display */}
                                            <div className="flex flex-col items-center justify-center min-w-[120px] space-y-1">
                                                <div className="text-2xl font-black text-primary-950 tabular-nums leading-none">{slot.startTime}</div>
                                                <div className="text-[8px] font-black text-gray-300 uppercase tracking-widest">until</div>
                                                <div className="text-xl font-bold text-gray-400 tabular-nums leading-none">{slot.endTime}</div>
                                            </div>

                                            {/* Subject Node */}
                                            <div className="flex-1 space-y-2 text-center md:text-left">
                                                <div className="text-[9px] font-black text-accent-500 uppercase tracking-[0.3em] bg-accent-50 px-3 py-1 rounded-lg w-fit mx-auto md:mx-0">
                                                    {slotSubject}
                                                </div>
                                                <div className="flex items-center gap-3 justify-center md:justify-start">
                                                    <BookOpen size={16} className="text-gray-200" />
                                                    <span className="text-2xl font-black text-primary-950 uppercase italic tracking-tighter leading-tight">
                                                        {slotSubject}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 justify-center md:justify-start">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-accent-500"></div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{slotTeacher}</span>
                                                </div>
                                            </div>

                                            {/* Spatial Hub */}
                                            <div className="flex items-center gap-3 bg-gray-50 px-6 py-4 rounded-2xl border border-gray-100 min-w-[180px]">
                                                <MapPin size={18} className="text-gray-300" />
                                                <div className="text-left">
                                                    <p className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Location</p>
                                                    <p className="text-[11px] font-black text-primary-950 uppercase italic">{slot.room || "Field Axis"}</p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleOpenEditModal(slot, originalIndex)}
                                                    className="p-4 bg-gray-50 text-gray-300 rounded-2xl hover:bg-primary-950 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleRemoveSlot(originalIndex)}
                                                    className="p-4 bg-gray-50 text-gray-300 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-32 bg-white rounded-[4rem] border border-dashed border-gray-100 flex flex-col items-center justify-center text-center gap-4 opacity-50">
                                    <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-200">
                                        <Calendar size={24} />
                                    </div>
                                    <p className="text-[10px] font-black uppercase text-gray-300 tracking-[0.5em]">No Nodes Manifested</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Persistent Save Bar */}
            {selectedClassId && !loading && (
                <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 animate-bounce-in">
                    <button 
                        onClick={handleSaveTimetable}
                        disabled={saving}
                        className="px-12 py-6 bg-primary-950 text-white rounded-[2rem] shadow-2xl shadow-primary-950/40 flex items-center gap-6 group hover:scale-105 active:scale-95 transition-all"
                    >
                        <div className="flex flex-col text-left">
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/50 leading-none mb-1">Authorization Required</span>
                            <span className="text-xs font-black uppercase tracking-[0.3em]">Commit Matrix Schedule</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-accent-500 flex items-center justify-center group-hover:rotate-12 transition-transform">
                            {saving ? <Spinner size="sm" color="white" /> : <Save size={20} />}
                        </div>
                    </button>
                </div>
            )}

            {/* Slot Edit Modal */}
            {isEditModalOpen && (
                <Modal 
                    isOpen={isEditModalOpen} 
                    onClose={() => setIsEditModalOpen(false)} 
                    title={editingSlot ? "Adjust Temporal Node" : "Configure New Node"}
                >
                    <form onSubmit={handleSaveSlot} className="p-10 space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 ml-1">Curricular Unit (Subject)</label>
                                <select 
                                    required
                                    className="w-full px-8 py-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-accent-50 transition-all font-black uppercase text-[10px] tracking-widest"
                                    value={slotFormData.subject}
                                    onChange={e => {
                                        setSlotFormData({...slotFormData, subject: e.target.value, teacher: ""});
                                    }}
                                >
                                    <option value="">Select Subject Axis</option>
                                    {subjects.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 ml-1">Faculty Lead (Teacher)</label>
                                <select 
                                    className="w-full px-8 py-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-accent-50 transition-all font-black uppercase text-[10px] tracking-widest disabled:opacity-50"
                                    value={slotFormData.teacher}
                                    onChange={e => setSlotFormData({...slotFormData, teacher: e.target.value})}
                                    disabled={!slotFormData.subject}
                                >
                                    <option value="">Select Teacher</option>
                                    {subjects.find(s => s._id === slotFormData.subject)?.assignedTeachers?.map(t => (
                                        <option key={t._id} value={t._id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 ml-1">Start Temporal Axis</label>
                                <input 
                                    type="time"
                                    required
                                    className="w-full px-8 py-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-accent-50 font-black tabular-nums"
                                    value={slotFormData.startTime}
                                    onChange={e => setSlotFormData({...slotFormData, startTime: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 ml-1">End Temporal Axis</label>
                                <input 
                                    type="time"
                                    required
                                    className="w-full px-8 py-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-accent-50 font-black tabular-nums"
                                    value={slotFormData.endTime}
                                    onChange={e => setSlotFormData({...slotFormData, endTime: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 ml-1">Spatial Hub (Room)</label>
                            <input 
                                placeholder="e.g. LAB-01"
                                className="w-full px-8 py-5 bg-gray-50 rounded-2xl border-none outline-none focus:ring-4 focus:ring-accent-50 font-black uppercase text-[10px] tracking-widest"
                                value={slotFormData.room}
                                onChange={e => setSlotFormData({...slotFormData, room: e.target.value})}
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button 
                                type="submit" 
                                className="flex-1 py-6 bg-primary-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:bg-accent-500 transition-all shadow-xl shadow-primary-950/20"
                            >
                                {editingSlot ? "Update Axis" : "Instantiate Node"}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-10 py-6 bg-gray-50 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all"
                            >
                                Abort
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default AdminTimetable;
