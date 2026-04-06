import React, { useState, useEffect } from 'react';
import adminService from '../../api/adminService';
import useAuthStore from '../../stores/authStore';
import { toast } from 'react-toastify';
import { 
  DollarSign, 
  CreditCard, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  Download,
  AlertCircle,
  CheckCircle2,
  MoreVertical,
  User as UserIcon,
  ChevronRight,
  History,
  Pencil,
  Trash2,
  FileText,
  CheckSquare,
  XSquare
} from 'lucide-react';
import * as xlsx from 'xlsx';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Modal from '../../components/shared/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';

const AdminFees = () => {
    const { token } = useAuthStore();
    const [fees, setFees] = useState([]);
    const [analytics, setAnalytics] = useState({ totalPending: 0, totalCollected: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Modal states
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [selectedFee, setSelectedFee] = useState(null);
    const [classes, setClasses] = useState([]);
    
    const [issueData, setIssueData] = useState({
        targetType: 'Class',
        targetId: '',
        title: '',
        amountDue: '',
        dueDate: ''
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editData, setEditData] = useState({ title: '', amountDue: '', dueDate: '' });
    const [historyTab, setHistoryTab] = useState('payments');

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [feeToDelete, setFeeToDelete] = useState(null);

    const [paymentData, setPaymentData] = useState({
        amount: '',
        method: 'Cash',
        remarks: ''
    });

    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState("All");

    const fetchFees = async () => {
        setLoading(true);
        try {
            const res = await adminService.getFees(token);
            setFees(res.fees || []);
            setAnalytics(res.analytics || { totalPending: 0, totalCollected: 0 });
        } catch (error) {
            toast.error("Failed to fetch fees.");
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await adminService.getClasses(token);
            setClasses(res || []);
        } catch (error) {}
    };

    useEffect(() => {
        fetchFees();
        fetchClasses();
    }, []);

    const handleIssueFee = async (e) => {
        e.preventDefault();
        try {
            await adminService.createFee(issueData, token);
            toast.success("Fees issued successfully.");
            setIssueData({ targetType: 'Class', targetId: '', title: '', amountDue: '', dueDate: '' }); 
            setIsIssueModalOpen(false);
            fetchFees();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add fee.");
        }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        try {
            await adminService.recordPayment(selectedFee._id, paymentData, token);
            toast.success("Payment saved.");
            setIsPaymentModalOpen(false);
            fetchFees();
        } catch (error) {
            toast.error("Failed to save payment.");
        }
    };

    const handleEditFee = async (e) => {
        e.preventDefault();
        try {
            await adminService.updateFee(selectedFee._id, editData, token);
            toast.success("Fee updated successfully.");
            setIsEditModalOpen(false);
            fetchFees();
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update fee.");
        }
    };

    const handleDeleteFee = async () => {
        if (!feeToDelete) return;
        try {
            await adminService.deleteFee(feeToDelete._id, token);
            toast.success("Fee deleted successfully.");
            setIsDeleteModalOpen(false);
            setFeeToDelete(null);
            fetchFees();
        } catch (error) {
            toast.error("Failed to delete fee.");
        }
    };

    const filteredFees = fees.filter(f => {
        const query = searchTerm.toLowerCase();
        // Allow orphaned records to be visible when no search is active
        const matchesSearch = !query || 
                             f.student?.name?.toLowerCase().includes(query) ||
                             f.student?.uniqueId?.toLowerCase().includes(query);
        const matchesStatus = statusFilter === "All" || f.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleExport = () => {
        if (filteredFees.length === 0) {
            toast.warning("No data to export");
            return;
        }
        const exportData = filteredFees.map(f => ({
            "Description": f.title || "Academic Fee",
            "Student": f.student?.name,
            "ID": f.student?.uniqueId,
            "Class": f.student?.classId?.name || 'N/A',
            "Amount Due": f.amountDue,
            "Amount Paid": f.amountPaid,
            "Status": f.status,
            "Due Date": new Date(f.dueDate).toLocaleDateString()
        }));
        const ws = xlsx.utils.json_to_sheet(exportData);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Fees");
        xlsx.writeFile(wb, "Fee_Management_Report.xlsx");
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredFees.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredFees.map(f => f._id)));
        }
    };

    const toggleSelectOne = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkDelete = async () => {
        try {
            await adminService.deleteFeesBulk(Array.from(selectedIds), token);
            toast.success(`Deleted ${selectedIds.size} fee records.`);
            setSelectedIds(new Set());
            setIsBulkDeleteModalOpen(false);
            fetchFees();
        } catch (error) {
            toast.error("Failed to perform bulk deletion.");
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'Paid': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
            case 'Partial': return 'text-amber-500 bg-amber-50 border-amber-100';
            case 'Overdue': return 'text-red-500 bg-red-50 border-red-100';
            default: return 'text-primary-950 bg-gray-50 border-gray-100';
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Spinner size="xl" /></div>;

    return (
        <div className="p-4 sm:p-8 md:p-12 space-y-8 md:space-y-14 w-full overflow-x-hidden box-border">
            {/* Header Section */}
            <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-accent-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Fees</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-primary-950 tracking-tighter">
                        Fee <span className="text-accent-500">Management</span>
                    </h1>
                </div>
                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <Button 
                        variant="accent" 
                        className="px-8 py-4 rounded-2xl flex items-center gap-3 shadow-xl shadow-accent-500/20"
                        onClick={() => setIsIssueModalOpen(true)}
                    >
                        <Plus size={18} />
                        <span className="font-black uppercase tracking-widest text-[10px]">Add Fee</span>
                    </Button>
                </div>
            </div>

            {/* Analytics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                    <div className="w-12 h-12 bg-accent-50 rounded-2xl flex items-center justify-center text-accent-500">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pending Fees</p>
                        <p className="text-3xl font-black text-primary-950 tabular-nums italic">₹{analytics.totalPending?.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Total Collected</p>
                        <p className="text-3xl font-black text-primary-950 tabular-nums">₹{analytics.totalCollected?.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Total Items</p>
                        <p className="text-3xl font-black text-primary-950 tabular-nums">{fees.length} <span className="text-sm text-gray-300">items</span></p>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative flex-1 group w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent-500 transition-colors" size={20} />
                    <input 
                        type="text"
                        placeholder="Search Student (Name or ID)..."
                        className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 rounded-[2rem] outline-none group-focus-within:ring-4 group-focus-within:ring-accent-50 transition-all font-bold text-sm tracking-widest uppercase italic"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Select Mode Toggle */}
                    {isSelectMode ? (
                        <>
                            <button 
                                onClick={() => { setIsSelectMode(false); setSelectedIds(new Set()); }}
                                className="flex-1 md:flex-none px-6 py-5 bg-gray-950 text-white rounded-[1.5rem] flex items-center gap-3 hover:bg-gray-800 transition-all"
                            >
                                <XSquare size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Cancel</span>
                            </button>
                            {selectedIds.size > 0 && (
                                <button 
                                    onClick={() => setIsBulkDeleteModalOpen(true)}
                                    className="flex-1 md:flex-none px-6 py-5 bg-red-500 text-white rounded-[1.5rem] flex items-center gap-3 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                                >
                                    <Trash2 size={18} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Delete ({selectedIds.size})</span>
                                </button>
                            )}
                        </>
                    ) : (
                        <button 
                            onClick={() => setIsSelectMode(true)}
                            className="flex-1 md:flex-none px-6 py-5 bg-white border border-gray-100 rounded-[1.5rem] text-primary-950 flex items-center gap-3 hover:border-accent-500 hover:text-accent-500 transition-all"
                        >
                            <CheckSquare size={18}/>
                            <span className="text-[10px] font-black uppercase tracking-widest">Select</span>
                        </button>
                    )}

                    {/* Filter Status */}
                    <div className="relative flex-1 md:flex-none min-w-[140px]">
                        <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-accent-500 pointer-events-none" size={16} />
                        <select 
                            className="w-full pl-12 pr-6 py-5 bg-white border border-gray-100 rounded-[1.5rem] outline-none appearance-none cursor-pointer text-[10px] font-black uppercase tracking-widest text-primary-950 hover:border-accent-500 transition-colors"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">Status (All)</option>
                            <option value="Paid">Paid Only</option>
                            <option value="Pending">Pending Only</option>
                            <option value="Partial">Partial Only</option>
                            <option value="Overdue">Overdue Only</option>
                        </select>
                    </div>

                    {/* Download */}
                    <button 
                        onClick={handleExport}
                        className="p-5 bg-white border border-gray-100 rounded-[1.5rem] text-gray-400 hover:text-blue-500 hover:border-blue-100 transition-all"
                        title="Export to Excel"
                    >
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Fee Ledger Table */}
            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] border border-gray-100 shadow-sm w-full overflow-hidden">
                <div className="w-full overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left min-w-max lg:min-w-full">
                        <thead>
                            <tr className="border-b border-gray-50">
                                {isSelectMode && (
                                    <th className="px-5 py-6">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded border-gray-300 text-accent-500 focus:ring-accent-500 transition-all cursor-pointer"
                                            checked={filteredFees.length > 0 && selectedIds.size === filteredFees.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                )}
                                <th className="px-5 py-6 text-[10px] whitespace-nowrap font-black uppercase tracking-[0.2em] text-gray-400">Description</th>
                                <th className="px-5 py-6 text-[10px] whitespace-nowrap font-black uppercase tracking-[0.2em] text-gray-400">Student</th>
                                <th className="px-5 py-6 text-[10px] whitespace-nowrap font-black uppercase tracking-[0.2em] text-gray-400">Class</th>
                                <th className="px-5 py-6 text-[10px] whitespace-nowrap font-black uppercase tracking-[0.2em] text-gray-400">Amount</th>
                                <th className="px-5 py-6 text-[10px] whitespace-nowrap font-black uppercase tracking-[0.2em] text-gray-400">Status</th>
                                <th className="px-5 py-6 text-[10px] whitespace-nowrap font-black uppercase tracking-[0.2em] text-gray-400">Deadline</th>
                                <th className="px-5 py-6 text-[10px] whitespace-nowrap font-black uppercase tracking-[0.2em] text-gray-400 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredFees.map((fee) => (
                                <tr 
                                    key={fee._id} 
                                    className={`hover:bg-gray-50/50 transition-colors group ${selectedIds.has(fee._id) ? 'bg-accent-50/10' : ''} ${isSelectMode ? 'cursor-pointer' : ''}`}
                                    onClick={isSelectMode ? () => toggleSelectOne(fee._id) : undefined}
                                >
                                    {isSelectMode && (
                                        <td className="px-5 py-5" onClick={(e) => e.stopPropagation()}>
                                            <input 
                                                type="checkbox" 
                                                className="w-4 h-4 rounded border-gray-300 text-accent-500 focus:ring-accent-500 transition-all cursor-pointer"
                                                checked={selectedIds.has(fee._id)}
                                                onChange={() => toggleSelectOne(fee._id)}
                                            />
                                        </td>
                                    )}
                                    <td className="px-5 py-5 text-xs font-black text-primary-950 uppercase italic tracking-tighter">
                                        {fee.title || "Academic Fee"}
                                    </td>
                                    <td className="px-5 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary-950/5 flex items-center justify-center text-primary-950 font-black italic">
                                                {fee.student?.name?.charAt(0) || <AlertCircle size={14} className="text-gray-300" />}
                                            </div>
                                            <div>
                                                <p className="font-black text-primary-950 uppercase tracking-tighter italic">
                                                    {fee.student?.name || <span className="text-gray-300">Reference Removed</span>}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                                                    {fee.student?.uniqueId || "N/A"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 text-gray-500">
                                        <span className="text-xs font-black uppercase tracking-widest italic">{fee.student?.classId ? `${fee.student.classId.name}${fee.student.classId.stream !== 'General' ? ` (${fee.student.classId.stream})` : ''}` : "N/A"}</span>
                                    </td>
                                    <td className="px-5 py-5">
                                        <div className="space-y-1">
                                            <p className="font-black text-primary-950 tabular-nums italic">₹{fee.amountDue?.toLocaleString()}</p>
                                            <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Paid: ₹{fee.amountPaid?.toLocaleString()}</p>
                                        </div>
                                    </td>
                                    <td className="px-5 py-5">
                                        <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-2 ${getStatusColor(fee.status)}`}>
                                            <div className={`w-1 h-1 rounded-full ${fee.status === 'Paid' ? 'bg-emerald-500' : 'bg-current'}`} />
                                            {fee.status}
                                        </div>
                                    </td>
                                    <td className="px-5 py-5">
                                        <p className="text-xs font-bold text-gray-500 tabular-nums">
                                            {new Date(fee.dueDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                        </p>
                                    </td>
                                    <td className="px-5 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                                            <button 
                                                onClick={() => {
                                                    setSelectedFee(fee);
                                                    setEditData({ 
                                                        title: fee.title || '', 
                                                        amountDue: fee.amountDue, 
                                                        dueDate: fee.dueDate ? new Date(fee.dueDate).toISOString().split('T')[0] : '' 
                                                    });
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="w-8 h-8 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-200 transition-all shadow-sm"
                                                title="Edit Fee"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setFeeToDelete(fee);
                                                    setIsDeleteModalOpen(true);
                                                }}
                                                className="w-8 h-8 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
                                                title="Delete Fee"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setSelectedFee(fee);
                                                    setPaymentData({ amount: fee.amountDue - fee.amountPaid, method: 'Cash', remarks: '' });
                                                    setIsPaymentModalOpen(true);
                                                }}
                                                disabled={fee.status === 'Paid'}
                                                className="w-8 h-8 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-accent-500 hover:border-accent-200 transition-all shadow-sm disabled:opacity-0"
                                                title="Collect Payment"
                                            >
                                                <ChevronRight size={14} />
                                            </button>
                                            <button 
                                                onClick={() => {
                                                    setSelectedFee(fee);
                                                    setHistoryTab('payments');
                                                    setIsHistoryModalOpen(true);
                                                }}
                                                className="w-8 h-8 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary-950 hover:border-gray-200 transition-all shadow-sm"
                                                title="View History & Audit Log"
                                            >
                                                <History size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Issue Fee Modal */}
            {isIssueModalOpen && (
                <Modal 
                    isOpen={isIssueModalOpen} 
                    onClose={() => setIsIssueModalOpen(false)} 
                    title="Add New Fee"
                >
                    <form onSubmit={handleIssueFee} className="p-6 md:p-10 space-y-6 md:space-y-8">
                        <Input 
                            label="Fee Title" 
                            placeholder="e.g. Library Fee, Annual Function, Sports Charge"
                            value={issueData.title}
                            onChange={(e) => setIssueData({...issueData, title: e.target.value})}
                            required
                        />
                        <div className="grid grid-cols-2 gap-8">
                            <Select 
                                label="Type" 
                                value={issueData.targetType}
                                onChange={(e) => setIssueData({...issueData, targetType: e.target.value, targetId: ''})}
                            >
                                <option value="Class">Specific Class</option>
                                <option value="Student">Individual Student</option>
                            </Select>
                            
                            {issueData.targetType === 'Class' ? (
                                <Select 
                                    label="Target Class" 
                                    value={issueData.targetId}
                                    onChange={(e) => setIssueData({...issueData, targetId: e.target.value})}
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}{c.stream !== 'General' ? ` (${c.stream})` : ''}</option>)}
                                </Select>
                            ) : (
                                <Input 
                                    label="Student Unique ID" 
                                    placeholder="STUXXXX"
                                    value={issueData.targetId}
                                    onChange={(e) => setIssueData({...issueData, targetId: e.target.value})}
                                    required
                                />
                            )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8">
                            <Input 
                                label="Amount Due (INR)" 
                                type="number" 
                                placeholder="5000"
                                value={issueData.amountDue}
                                onChange={(e) => setIssueData({...issueData, amountDue: e.target.value})}
                                required
                            />
                            <Input 
                                label="Deadline Date" 
                                type="date"
                                value={issueData.dueDate}
                                onChange={(e) => setIssueData({...issueData, dueDate: e.target.value})}
                                required
                            />
                        </div>

                        <div className="pt-8 border-t border-gray-100 flex gap-4">
                            <Button variant="secondary" onClick={() => setIsIssueModalOpen(false)} className="px-8 py-4">Cancel</Button>
                            <Button type="submit" variant="accent" className="flex-1 py-4 font-black">Create Fee</Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <Modal 
                    isOpen={isPaymentModalOpen} 
                    onClose={() => setIsPaymentModalOpen(false)} 
                    title="Collect Payment"
                >
                    <form onSubmit={handleRecordPayment} className="p-10 space-y-8 text-center">
                        <div className="space-y-2">
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 italic">Collect Payment for</p>
                           <h3 className="text-2xl font-black text-primary-950 italic">{selectedFee?.student?.name}</h3>
                           <p className="text-xs font-bold text-accent-500 tabular-nums">Remaining: ₹{(selectedFee?.amountDue - selectedFee?.amountPaid).toLocaleString()}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8 text-left">
                            <Input 
                                label="Amount Paying" 
                                type="number" 
                                value={paymentData.amount}
                                onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                                required
                            />
                            <Select 
                                label="Method" 
                                value={paymentData.method}
                                onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                            >
                                <option value="Cash">Cash Currency</option>
                                <option value="Online">Digital Transfer</option>
                                <option value="Cheque">Bank Instrument</option>
                            </Select>
                        </div>

                        <div className="text-left space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Remarks / Notes</label>
                            <textarea 
                                className="w-full p-6 bg-gray-50 border border-gray-100 rounded-3xl outline-none focus:ring-4 focus:ring-accent-50 transition-all font-bold text-sm h-32 resize-none"
                                placeholder="Add payment details, reference numbers, etc..."
                                value={paymentData.remarks}
                                onChange={(e) => setPaymentData({...paymentData, remarks: e.target.value})}
                            />
                        </div>

                        <div className="pt-8 border-t border-gray-100 flex gap-4">
                            <Button variant="secondary" onClick={() => setIsPaymentModalOpen(false)} className="px-8 py-4">Cancel</Button>
                            <Button type="submit" variant="accent" className="flex-1 py-4 font-black uppercase tracking-widest text-[10px]">Save Payment</Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Payment & Audit History Modal */}
            {isHistoryModalOpen && (
                <Modal 
                    isOpen={isHistoryModalOpen} 
                    onClose={() => setIsHistoryModalOpen(false)} 
                    title="Fee History & Logs"
                >
                    <div className="p-10 space-y-6">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-primary-950 italic">{selectedFee?.student?.name}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedFee?.student?.uniqueId}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Paid</p>
                                <p className="text-2xl font-black text-emerald-500 italic">₹{selectedFee?.amountPaid?.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-4 border-b border-gray-100 pb-2">
                            <button 
                                onClick={() => setHistoryTab('payments')}
                                className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-colors ${historyTab === 'payments' ? 'border-accent-500 text-accent-500' : 'border-transparent text-gray-400 hover:text-primary-950'}`}
                            >
                                Payments
                            </button>
                            <button 
                                onClick={() => setHistoryTab('audit')}
                                className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-colors ${historyTab === 'audit' ? 'border-accent-500 text-accent-500' : 'border-transparent text-gray-400 hover:text-primary-950'}`}
                            >
                                Audit Log
                            </button>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {historyTab === 'payments' ? (
                                selectedFee?.paymentHistory?.length > 0 ? (
                                    selectedFee.paymentHistory.map((h, i) => (
                                        <div key={i} className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex items-start justify-between gap-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-gray-50">
                                                        <CheckCircle2 size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-primary-950 underline decoration-accent-500/30 underline-offset-4">₹{h.amount?.toLocaleString()}</p>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(h.date).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                {h.remarks && (
                                                    <div className="mt-4 p-4 bg-white/50 rounded-2xl border border-white text-[10px] font-medium text-gray-500 italic">
                                                        "{h.remarks}"
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${h.method === 'Online' ? 'bg-violet-50 text-violet-500' : 'bg-amber-50 text-amber-500'}`}>
                                                {h.method}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center text-gray-300 font-black uppercase tracking-widest italic opacity-50">
                                        No Payments Recorded
                                    </div>
                                )
                            ) : (
                                selectedFee?.auditLog?.length > 0 ? (
                                    [...selectedFee.auditLog].reverse().map((log, i) => (
                                        <div key={i} className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex gap-4">
                                            <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                                <FileText size={14} />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-primary-950 uppercase tracking-widest">{log.action}</p>
                                                <p className="text-[10px] font-bold text-gray-400 mb-2">{new Date(log.date).toLocaleString()}</p>
                                                <p className="text-xs font-medium text-gray-600 italic bg-gray-50 p-3 rounded-xl">{log.details}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center text-gray-300 font-black uppercase tracking-widest italic opacity-50">
                                        No Audit Logs Found
                                    </div>
                                )
                            )}
                        </div>
                        <div className="pt-8 border-t border-gray-100 mt-6">
                            <Button variant="secondary" onClick={() => setIsHistoryModalOpen(false)} className="w-full py-4 uppercase tracking-widest text-[10px] font-black">Close History</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Edit Fee Modal */}
            {isEditModalOpen && (
                <Modal 
                    isOpen={isEditModalOpen} 
                    onClose={() => setIsEditModalOpen(false)} 
                    title="Edit Fee Details"
                >
                    <form onSubmit={handleEditFee} className="p-6 md:p-10 space-y-6 md:space-y-8">
                        <Input 
                            label="Fee Title" 
                            placeholder="e.g. Library Fee, Annual Function"
                            value={editData.title}
                            onChange={(e) => setEditData({...editData, title: e.target.value})}
                            required
                        />
                        <div className="grid grid-cols-2 gap-8">
                            <Input 
                                label="Amount Due (INR)" 
                                type="number" 
                                value={editData.amountDue}
                                onChange={(e) => setEditData({...editData, amountDue: e.target.value})}
                                required
                            />
                            <Input 
                                label="Deadline Date" 
                                type="date"
                                value={editData.dueDate}
                                onChange={(e) => setEditData({...editData, dueDate: e.target.value})}
                                required
                            />
                        </div>

                        <div className="pt-8 border-t border-gray-100 flex gap-4">
                            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)} className="px-8 py-4">Cancel</Button>
                            <Button type="submit" variant="accent" className="flex-1 py-4 font-black">Save Changes</Button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete Fee Modal */}
            {isDeleteModalOpen && (
                <Modal 
                    isOpen={isDeleteModalOpen} 
                    onClose={() => setIsDeleteModalOpen(false)} 
                    title="Delete Fee"
                >
                    <div className="p-6 md:p-10 space-y-6 md:space-y-8 text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                            <Trash2 size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-primary-950">Are you sure?</h3>
                            <p className="text-sm font-medium text-gray-500 mt-2">
                                You are about to permanently delete this fee. This action cannot be undone and will erase all associated payment history.
                            </p>
                        </div>
                        <div className="pt-8 border-t border-gray-100 flex gap-4">
                            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} className="px-8 py-4">Cancel</Button>
                            <Button onClick={handleDeleteFee} className="flex-1 py-4 font-black bg-red-500 hover:bg-red-600 text-white border-transparent">Delete Fee</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Bulk Delete Fee Modal */}
            {isBulkDeleteModalOpen && (
                <Modal 
                    isOpen={isBulkDeleteModalOpen} 
                    onClose={() => setIsBulkDeleteModalOpen(false)} 
                    title="Bulk Delete Fees"
                >
                    <div className="p-6 md:p-10 space-y-6 md:space-y-8 text-center">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                            <Trash2 size={32} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-primary-950 italic uppercase tracking-tighter">Purge Selected Records?</h3>
                            <p className="text-sm font-medium text-gray-400 mt-2">
                                You are about to permanently delete <span className="text-red-500 font-black">{selectedIds.size}</span> fee records. This operation is irreversible and will remove all associated financial data.
                            </p>
                        </div>
                        <div className="pt-8 border-t border-gray-100 flex gap-4">
                            <Button variant="secondary" onClick={() => setIsBulkDeleteModalOpen(false)} className="px-8 py-4">Retain Data</Button>
                            <Button onClick={handleBulkDelete} className="flex-1 py-4 font-black bg-red-500 hover:bg-red-600 text-white border-transparent shadow-xl shadow-red-500/20">Delete All Selected</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminFees;
