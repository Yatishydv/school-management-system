import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search,
  Filter,
  TrendingUp,
  ArrowUpRight,
  TrendingDown,
  ArrowDownRight,
  CreditCard,
  Building,
  ShieldCheck,
  FileText,
  Eye,
  Calendar,
  IndianRupee,
  Download,
  Activity,
  User,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from "lucide-react";
import useAuthStore from "../../stores/authStore";
import financeService from "../../api/financeService";
import { toast } from "react-toastify";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import Modal from "../../components/shared/Modal";

const AdminRevenue = () => {
    const { token } = useAuthStore();
    const [transactions, setTransactions] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [filterType, setFilterType] = useState('All'); // 'All', 'Income', 'Expense'

    const fetchData = async () => {
        setLoading(true);
        try {
            const summaryData = await financeService.getSummary(token);
            const allTx = await financeService.getAllTransactions(token);
            setSummary(summaryData);
            setTransactions(allTx || []);
        } catch (err) {
            toast.error("Could not load the money history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchData();
    }, [token]);

    const filteredTransactions = transactions.filter(t => {
        const title = t.title || "";
        const subtitle = t.subtitle || "";
        const category = t.category || "";
        
        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'All' || t.type === filterType;
        return matchesSearch && matchesFilter;
    });

    // Prepare chart data (Monthly cashflow)
    const monthlyData = transactions.reduce((acc, curr) => {
        const date = new Date(curr.date);
        const key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        if (!acc[key]) acc[key] = { name: key, inflow: 0, outflow: 0 };
        if (curr.type === 'Income') acc[key].inflow += curr.amount;
        else acc[key].outflow += curr.amount;
        return acc;
    }, {});

    const chartData = Object.values(monthlyData).reverse().slice(-6);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-primary-950 border-t-emerald-500 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 pb-24 space-y-10">
            {/* HEADER */}
            <header className="px-8 md:px-14 pt-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">School Wallet Overview</span>
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none text-primary-950">
                        Money <span className="text-gray-200">Center.</span>
                    </h1>
                    <p className="text-gray-400 font-bold max-w-md mt-4 tracking-tight">
                        See every rupee coming in and going out of the school here.
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <button className="flex items-center gap-3 px-8 py-5 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary-950 hover:border-primary-950 transition-all shadow-sm">
                        <Download size={16} />
                        Download Full History
                    </button>
                </div>
            </header>

            <div className="px-8 md:px-14 space-y-10">
                {/* QUICK CARDS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 flex flex-col justify-between group hover:border-emerald-500 transition-all">
                            <div className="flex justify-between items-start">
                                <div className="p-4 bg-emerald-50 text-emerald-500 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                    <TrendingUp size={24} />
                                </div>
                                <ArrowUpRight className="text-emerald-500" size={20} />
                            </div>
                            <div className="space-y-1 text-left">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-left">Total Money In</p>
                                <h3 className="text-4xl font-black text-primary-950 tracking-tighter text-left">₹{(summary?.totalRevenue || 0).toLocaleString()}</h3>
                                <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Fees & Income</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 flex flex-col justify-between group hover:border-amber-500 transition-all">
                            <div className="flex justify-between items-start">
                                <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-all">
                                    <TrendingDown size={24} />
                                </div>
                                <ArrowDownRight className="text-amber-500" size={20} />
                            </div>
                            <div className="space-y-1 text-left">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-left">Total Money Out</p>
                                <h3 className="text-4xl font-black text-primary-950 tracking-tighter text-left">₹{(summary?.totalExpenses || 0).toLocaleString()}</h3>
                                <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Bills & Salaries</p>
                            </div>
                        </div>

                        <div className="bg-primary-950 p-8 rounded-[2.5rem] shadow-2xl space-y-8 flex flex-col justify-between text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
                            <div className="flex justify-between items-start">
                                <div className="p-4 bg-white/10 rounded-2xl">
                                    <ShieldCheck size={24} className="text-emerald-500" />
                                </div>
                            </div>
                            <div className="space-y-1 relative z-10 text-left">
                                <p className="text-[10px] font-black opacity-40 uppercase tracking-widest italic text-left">Final School Balance</p>
                                <h3 className="text-4xl font-black tracking-tighter text-left">₹{(summary?.netProfit || 0).toLocaleString()}</h3>
                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Profit / Savings</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mb-6 text-left">Money Flow Trend</span>
                        <div className="flex-1 h-32">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData}>
                                 <defs>
                                    <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                 </defs>
                                 <Area type="monotone" dataKey="inflow" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorInflow)" />
                                 <Tooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }} />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* SEARCH & FILTERS */}
                <div className="flex flex-col lg:flex-row items-center gap-6">
                    <div className="relative group flex-1 w-full lg:w-auto">
                        <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="Find any item by name or type..."
                            className="w-full h-20 pl-20 pr-10 bg-white rounded-3xl border border-gray-100 shadow-sm outline-none focus:ring-4 focus:ring-emerald-50 transition-all text-sm font-black text-primary-950 placeholder:text-gray-300"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex gap-2 p-2 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        {['All', 'Income', 'Expense'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    filterType === type 
                                    ? 'bg-primary-950 text-white shadow-lg shadow-primary-950/20' 
                                    : 'text-gray-400 hover:text-primary-950'
                                }`}
                            >
                                {type === 'All' ? 'Everything' : type === 'Income' ? 'Money In' : 'Money Out'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* MASTER LEDGER */}
                <section className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-sm overflow-hidden animate-fade-up">
                    <div className="flex justify-between items-center mb-10 px-4">
                        <div className="flex items-center gap-3 text-left">
                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                            <h3 className="text-xl font-black text-primary-950 tracking-tight italic">All Transactions.</h3>
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{filteredTransactions.length} Total Records</span>
                    </div>

                    <table className="w-full border-separate border-spacing-y-4">
                        <thead>
                            <tr className="text-left text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">
                                <th className="px-8 pb-4">Details</th>
                                <th className="px-8 pb-4">Category</th>
                                <th className="px-8 pb-4">Method & Date</th>
                                <th className="px-8 pb-4 text-center italic">View</th>
                                <th className="px-8 pb-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="space-y-4">
                            {filteredTransactions.map((t) => (
                                <tr key={t._id} className="group hover:bg-gray-50 transition-all duration-300 rounded-2xl">
                                    <td className="px-8 py-6 rounded-l-2xl border-y border-l border-transparent group-hover:border-gray-100 text-left">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
                                                t.type === 'Income' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
                                            }`}>
                                                {t.type === 'Income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="font-black text-primary-950 tracking-tight">{t.title}</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t.subtitle}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 border-y border-transparent group-hover:border-gray-100 text-left">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest italic border ${
                                            t.type === 'Income' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 'bg-red-50 text-red-500 border-red-100'
                                        }`}>
                                            {t.category}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 border-y border-transparent group-hover:border-gray-100 text-left">
                                        <div className="flex flex-col gap-1 text-left">
                                            <span className="text-xs font-black text-primary-950">{t.paymentMethod}</span>
                                            <span className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{new Date(t.date).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center border-y border-transparent group-hover:border-gray-100">
                                        <button 
                                            onClick={() => { setSelectedTransaction(t); setShowDetailModal(true); }}
                                            className="p-3 bg-white border border-gray-100 text-primary-950 rounded-xl hover:bg-primary-950 hover:text-white transition-all shadow-sm"
                                        >
                                            <Eye size={14} />
                                        </button>
                                    </td>
                                    <td className="px-8 py-6 rounded-r-2xl text-right border-y border-r border-transparent group-hover:border-gray-100">
                                        <span className={`text-base font-black tracking-tighter ${
                                            t.type === 'Income' ? 'text-emerald-600' : 'text-red-500'
                                        }`}>
                                            {t.type === 'Income' ? '+' : '-'}₹{(t.amount || 0).toLocaleString()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!filteredTransactions.length && (
                        <div className="py-24 flex flex-col items-center justify-center opacity-40 space-y-4">
                            <BarChartIcon size={48} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-center">No transactions found here</p>
                        </div>
                    )}
                </section>
            </div>

            {/* DETAIL MODAL */}
            <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Payment Receipt" size="2xl">
                {selectedTransaction && (
                    <div className="p-12 space-y-12">
                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-4xl font-black shadow-2xl ${
                                selectedTransaction.type === 'Income' ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-red-500 shadow-red-500/30'
                            } text-white`}>
                                <FileText size={40} />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black text-primary-950 tracking-tighter leading-none">{selectedTransaction.title}</h2>
                                <p className="text-[10px] font-black text-accent-500 uppercase tracking-[0.3em] mt-2 italic">{selectedTransaction.subtitle}</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-[3rem] p-10 border border-gray-100 grid grid-cols-2 gap-y-10 gap-x-8">
                            <div className="text-left">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Transaction Type</p>
                                <p className="text-xl font-black text-primary-950 tracking-tight">{selectedTransaction.category}</p>
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 italic">Bill Reference</p>
                                <p className="text-sm font-black text-primary-950 tracking-widest break-all font-mono italic">{selectedTransaction.reference || "SYSTEM_RECORD"}</p>
                            </div>
                            <div className="pt-8 border-t border-gray-100 col-span-2 grid grid-cols-2 gap-8">
                                <div className="text-left">
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Paid Using</p>
                                    <p className="text-2xl font-black text-primary-950 tracking-tighter">{selectedTransaction.paymentMethod}</p>
                                </div>
                                <div className="text-left">
                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                                        selectedTransaction.type === 'Income' ? 'text-emerald-500' : 'text-red-500'
                                    }`}>Final Amount</p>
                                    <p className={`text-4xl font-black tracking-tighter ${
                                        selectedTransaction.type === 'Income' ? 'text-emerald-600' : 'text-red-500'
                                    }`}>₹{(selectedTransaction.amount || 0).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <button onClick={() => setShowDetailModal(false)} className="w-full py-5 bg-primary-950 text-white rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-950/20 hover:bg-emerald-500 transition-all">Close Receipt</button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminRevenue;
