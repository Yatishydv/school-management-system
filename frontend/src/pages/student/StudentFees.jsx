// frontend/src/pages/student/StudentFees.jsx

import React, { useEffect, useState } from "react";
import { 
  CreditCard, History, AlertCircle, CheckCircle, 
  Download, ExternalLink, Shield, Layers, 
  Activity, ArrowUpRight, Wallet, Clock, 
  ArrowRight, ShieldCheck, Pocket
} from "lucide-react";
import studentService from "../../api/studentService";
import useAuthStore from "../../stores/authStore";
import { toast } from "react-toastify";
import Spinner from "../../components/ui/Spinner";

const StudentFees = () => {
    const { token } = useAuthStore();
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await studentService.getFees(token);
                setFees(res || []);
            } catch (err) {
                toast.error("Failed to fetch academic dues.");
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchData();
    }, [token]);

    const totalDue = fees.reduce((acc, f) => acc + (f.amountDue - f.amountPaid), 0);

    const getStatusColor = (status) => {
        switch(status) {
            case 'Paid': return "text-green-600 bg-green-50 border-green-100";
            case 'Partial': return "text-blue-600 bg-blue-50 border-blue-100";
            case 'Overdue': return "text-red-600 bg-red-50 border-red-100";
            default: return "text-orange-600 bg-orange-50 border-orange-100";
        }
    };

    if (loading) return <div className="p-20 flex items-center justify-center min-h-screen animate-pulse"><Spinner size="xl" /></div>;

    return (
        <div className="min-h-screen bg-gray-50/20 pb-40 relative overflow-hidden font-body">
            {/* Vertical Editorial Watermark */}
            <div className="fixed right-[-5%] top-1/2 -translate-y-1/2 rotate-90 pointer-events-none select-none z-0 hidden lg:block">
                <h1 className="text-[18vh] font-black text-transparent uppercase tracking-tighter leading-none opacity-20" 
                    style={{ WebkitTextStroke: '1px rgba(30, 58, 138, 0.15)' }}>
                    FINANCE
                </h1>
            </div>

            <header className="px-8 md:px-14 pt-16 relative z-10 space-y-12 mb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-px bg-blue-600"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Billing Statement</span>
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black text-blue-950 tracking-tighter uppercase italic leading-none">
                            Fee <span className="text-gray-200">Summary.</span>
                        </h1>
                    </div>

                    <div className="p-10 bg-blue-950 rounded-[4rem] text-white flex items-center gap-12 shadow-[0_20px_50px_-15px_rgba(29,78,216,0.3)] relative overflow-hidden group">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="w-24 h-24 rounded-[2.5rem] bg-white/10 flex items-center justify-center text-blue-400 group-hover:rotate-12 transition-all">
                            <Wallet size={48} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500 mb-1 opacity-60">Aggregate Due</p>
                            <p className="text-6xl font-black italic tabular-nums italic tracking-tighter">₹{totalDue.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="px-8 md:px-14 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Active Dues */}
                    <section className="space-y-10">
                        <div className="flex items-center gap-6">
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-blue-950">Pending Invoices</h2>
                            <div className="h-px flex-1 bg-gray-100"></div>
                        </div>
                        
                        <div className="space-y-8">
                            {fees.map(f => (
                                <div key={f._id} className="group bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
                                     <div className={`absolute top-0 left-0 w-2 h-0 group-hover:h-full transition-all duration-500 ${f.status === 'Paid' ? 'bg-green-500' : 'bg-blue-600'}`}></div>
                                     <div className="flex justify-between items-start mb-10">
                                        <div className="space-y-2">
                                            <h4 className="text-2xl font-black text-blue-950 uppercase italic tracking-tighter group-hover:translate-x-2 transition-transform">{f.title || "Academic Program Fee"}</h4>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Maturation Date: {new Date(f.dueDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusColor(f.status)}`}>
                                            {f.status}
                                        </div>
                                     </div>
                                     <div className="grid grid-cols-2 gap-6 p-2">
                                        <div className="p-6 bg-gray-50 rounded-[1.5rem] border border-transparent group-hover:bg-white group-hover:border-blue-50 transition-all shadow-inner group-hover:shadow-sm">
                                            <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mb-2">Total Amount</p>
                                            <p className="text-2xl font-black text-blue-950 tabular-nums italic">₹{f.amountDue.toLocaleString()}</p>
                                        </div>
                                        <div className="p-6 bg-blue-50/20 rounded-[1.5rem] border border-transparent group-hover:bg-blue-50/50 group-hover:border-blue-100 transition-all shadow-inner group-hover:shadow-sm">
                                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Contribution Recorded</p>
                                            <p className="text-2xl font-black text-blue-600 tabular-nums italic">₹{f.amountPaid.toLocaleString()}</p>
                                        </div>
                                     </div>
                                </div>
                            ))}
                            {fees.length === 0 && (
                                <div className="py-32 bg-white rounded-[4rem] border border-dashed border-gray-100 flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
                                    <ShieldCheck size={48} className="text-gray-100" />
                                    <div className="space-y-2">
                                        <p className="text-sm font-black uppercase italic text-blue-950 tracking-tighter">Account Status Clear</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">No pending financial obligations detected.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* History */}
                    <section className="space-y-10">
                        <div className="flex items-center gap-6">
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter text-blue-950">Transaction Log</h2>
                            <div className="h-px flex-1 bg-gray-100"></div>
                        </div>

                        <div className="bg-white rounded-[4rem] p-10 space-y-6 border border-gray-100 shadow-sm shadow-blue-900/5">
                            {fees.flatMap(f => f.paymentHistory.map((h, i) => (
                                <div key={i} className="group bg-gray-50/50 p-6 rounded-[2.5rem] border border-transparent hover:border-blue-100 hover:bg-white flex items-center justify-between gap-6 shadow-sm transition-all duration-500">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-white text-green-600 flex items-center justify-center shadow-sm group-hover:bg-green-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                                            <CheckCircle size={28} />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-black text-blue-950 uppercase italic tracking-tight">Financial Input Received</h4>
                                            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest tabular-nums">{new Date(h.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
                                            {h.remarks && (
                                                <div className="mt-3 inline-block px-4 py-2 bg-white rounded-xl border border-gray-100 group-hover:border-blue-50 transition-all">
                                                    <p className="text-[9px] font-bold text-gray-400 italic">"{h.remarks}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end gap-1">
                                        <p className="text-xl font-black text-blue-950 tabular-nums italic group-hover:text-blue-600 transition-colors">₹{h.amount.toLocaleString()}</p>
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-gray-100 text-[8px] font-black text-blue-400 uppercase tracking-widest shadow-sm">
                                            <Pocket size={10} /> {h.method}
                                        </div>
                                    </div>
                                </div>
                            )))}
                            {fees.every(f => f.paymentHistory.length === 0) && (
                                <div className="py-24 text-center space-y-6">
                                    <Activity size={40} className="text-gray-100 mx-auto" />
                                    <div className="space-y-1 text-[10px] font-black uppercase tracking-widest text-gray-300 italic">The financial archive is currently empty.</div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default StudentFees;
