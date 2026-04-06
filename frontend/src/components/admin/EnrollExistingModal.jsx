import React, { useState, useEffect } from 'react';
import { Search, UserPlus, X, Check, Hash } from 'lucide-react';
import adminService from '../../api/adminService';
import useAuthStore from '../../stores/authStore';
import { toast } from 'react-toastify';
import Spinner from '../ui/Spinner';

const EnrollExistingModal = ({ classId, onClose, onSuccess }) => {
    const { token } = useAuthStore();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selections, setSelections] = useState({}); // { id: rollNumber }
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const allStudents = await adminService.getUsers('student', token);
                // Filter out students already in this class
                const availableStudents = allStudents.filter(s => 
                    (s.classId?._id || s.classId) !== classId
                );
                setStudents(availableStudents);
            } catch (err) {
                console.error("Fetch Students Error:", err);
                toast.error("Failed to load potential candidates.");
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [token, classId]);

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.uniqueId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleSelect = (student) => {
        setSelections(prev => {
            const next = { ...prev };
            if (next[student._id] !== undefined) {
                delete next[student._id];
            } else {
                next[student._id] = student.rollNumber || "";
            }
            return next;
        });
    };

    const updateRollNumber = (id, val) => {
        setSelections(prev => ({
            ...prev,
            [id]: val
        }));
    };

    const handleEnroll = async () => {
        const enrollmentData = Object.keys(selections).map(id => ({
            id,
            rollNumber: selections[id]
        }));

        if (enrollmentData.length === 0) return;
        
        setProcessing(true);
        try {
            await adminService.enrollStudents({ enrollmentData, classId }, token);
            toast.success(`${enrollmentData.length} students enrolled with assigned attributes.`);
            onSuccess();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Enrollment sequence failed.");
        } finally {
            setProcessing(false);
        }
    };

    const selectedCount = Object.keys(selections).length;

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-primary-950 uppercase italic tracking-tighter">Candidate Selection</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select personnel & assign roll identifiers</p>
                </div>
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                    <input 
                        type="text"
                        placeholder="Search Identity..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl border border-transparent focus:bg-white focus:border-gray-100 outline-none transition-all text-xs font-medium"
                    />
                </div>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center"><Spinner size="lg" /></div>
            ) : (
                <div className="max-h-[450px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map(student => {
                            const isSelected = selections[student._id] !== undefined;
                            return (
                                <div 
                                    key={student._id}
                                    className={`flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-[2rem] border transition-all ${
                                        isSelected 
                                        ? 'bg-primary-950 border-primary-950 text-white shadow-xl shadow-primary-950/20' 
                                        : 'bg-white border-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-5 cursor-pointer" onClick={() => toggleSelect(student)}>
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic shadow-sm ${
                                            isSelected ? 'bg-white/10' : 'bg-gray-50 text-primary-950'
                                        }`}>
                                            {student.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black uppercase italic leading-none">{student.name}</p>
                                            <p className={`text-[9px] font-bold uppercase tracking-widest mt-1.5 ${
                                                isSelected ? 'text-white/40' : 'text-gray-300'
                                            }`}>
                                                UID: {student.uniqueId} • {student.classId?.name || "Unassigned"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 md:mt-0 flex items-center gap-4 w-full md:w-auto">
                                        {isSelected && (
                                            <div className="relative flex-1 md:flex-none">
                                                <Hash size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                                                <input 
                                                    type="text"
                                                    placeholder="Roll No"
                                                    value={selections[student._id]}
                                                    autoFocus
                                                    onChange={(e) => updateRollNumber(student._id, e.target.value)}
                                                    className="w-full md:w-32 pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none focus:bg-white/20 transition-all text-xs font-black uppercase tracking-widest placeholder:text-white/20"
                                                />
                                            </div>
                                        )}
                                        <div 
                                            onClick={() => toggleSelect(student)}
                                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                                                isSelected 
                                                ? 'bg-accent-500 border-accent-500 text-white' 
                                                : 'border-gray-100'
                                            }`}
                                        >
                                            {isSelected && <Check size={14} strokeWidth={4} />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-20 text-center space-y-4">
                            <p className="text-xs font-black text-gray-300 uppercase tracking-widest italic">No matching candidates discovered</p>
                        </div>
                    )}
                </div>
            )}

            <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <span className="text-primary-950">{selectedCount}</span> Records Selected
                    </p>
                    {selectedCount > 0 && (
                        <p className="text-[8px] font-bold text-accent-500 uppercase tracking-widest">Roll Identifiers Sync Active</p>
                    )}
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={onClose}
                        className="px-8 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 transition-all"
                    >
                        Abort
                    </button>
                    <button 
                        onClick={handleEnroll}
                        disabled={selectedCount === 0 || processing}
                        className="px-8 py-4 bg-primary-950 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-accent-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary-950/20 flex items-center gap-2"
                    >
                        {processing ? <Spinner size="sm" light /> : <UserPlus size={14} />}
                        Execute Enrolment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EnrollExistingModal;
