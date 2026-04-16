import Salary from '../models/Salary.js';
import Expense from '../models/Expense.js';
import Fee from '../models/Fee.js';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

// @desc    Get financial summary (Revenue vs Expenses)
// @route   GET /api/finance/summary
// @access  Private/Admin
export const getFinancialSummary = async (req, res) => {
    try {
        // 1. Calculate Revenue from Fee payments
        const fees = await Fee.find({});
        let totalRevenue = 0;
        fees.forEach(fee => {
            fee.paymentHistory.forEach(payment => {
                totalRevenue += payment.amount;
            });
        });

        // 2. Calculate Expenses from Salaries
        const salaries = await Salary.find({ status: 'Paid' });
        let totalSalariesPaid = 0;
        salaries.forEach(s => totalSalariesPaid += s.paidAmount);

        // 3. Calculate Other Expenses
        const otherExpenses = await Expense.find({});
        let totalOtherExpenses = 0;
        otherExpenses.forEach(e => totalOtherExpenses += e.amount);

        res.json({
            totalRevenue,
            totalExpenses: totalSalariesPaid + totalOtherExpenses,
            netProfit: totalRevenue - (totalSalariesPaid + totalOtherExpenses),
            breakdown: {
                salaries: totalSalariesPaid,
                other: totalOtherExpenses
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new expense
// @route   POST /api/finance/expenses
// @access  Private/Admin
export const addExpense = async (req, res) => {
    try {
        const { title, category, amount, description, paidTo, paymentMethod, referenceNumber, vendorName, vendorContact, vendorVerification } = req.body;
        const expense = new Expense({
            title,
            category,
            amount,
            description,
            paidTo,
            paymentMethod,
            referenceNumber,
            vendorName,
            vendorContact,
            vendorVerification,
            addedBy: req.user._id
        });
        await expense.save();
        res.status(201).json({ message: "Expense recorded archive successfully", expense });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all expenses
// @route   GET /api/finance/expenses
// @access  Private/Admin
export const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({}).sort({ date: -1 }).populate('addedBy', 'name');
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate pending salaries for all teachers
// @route   POST /api/finance/salaries/generate
// @access  Private/Admin
export const generateMonthlySalaries = async (req, res) => {
    const { month, year } = req.body;
    try {
        const teachers = await User.find({ role: 'teacher' });
        const existingSalaries = await Salary.find({ month, year });
        const existingTeacherIds = existingSalaries.map(s => s.teacher.toString());

        const newSalaries = [];
        for (const teacher of teachers) {
            if (!existingTeacherIds.includes(teacher._id.toString())) {
                newSalaries.push({
                    teacher: teacher._id,
                    month,
                    year,
                    baseSalary: teacher.baseSalary || 0,
                    paidAmount: 0,
                    status: 'Pending',
                    invoiceNumber: `SAL-${month.substring(0, 3).toUpperCase()}-${year}-${uuidv4().substring(0, 8)}`
                });
            }
        }

        if (newSalaries.length > 0) {
            await Salary.insertMany(newSalaries);
        }

        res.status(201).json({ message: `Generated ${newSalaries.length} salary records.` });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get all salaries
// @route   GET /api/finance/salaries
// @access  Private/Admin
export const getAllSalaries = async (req, res) => {
    try {
        const salaries = await Salary.find({}).populate('teacher', 'name uniqueId baseSalary').sort({ year: -1, createdAt: -1 });
        res.json(salaries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update/Pay salary
// @route   PUT /api/finance/salaries/:id
// @access  Private/Admin
export const updateSalary = async (req, res) => {
    const { bonus, deductions, paidAmount, status, paymentDate, paymentMethod, remarks, baseSalary } = req.body;
    try {
        const salary = await Salary.findById(req.params.id);
        if (salary) {
            salary.baseSalary = baseSalary ?? salary.baseSalary;
            salary.bonus = bonus ?? salary.bonus;
            salary.deductions = deductions ?? salary.deductions;
            salary.paidAmount = paidAmount ?? salary.paidAmount;
            salary.status = status ?? salary.status;
            salary.paymentDate = paymentDate ?? salary.paymentDate;
            salary.paymentMethod = paymentMethod ?? salary.paymentMethod;
            salary.remarks = remarks ?? salary.remarks;

            const updatedSalary = await salary.save();
            res.json(updatedSalary);
        } else {
            res.status(404).json({ message: 'Salary record not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get salaries for logged in teacher
// @route   GET /api/finance/my-salaries
// @access  Private/Teacher
export const getMySalaries = async (req, res) => {
    try {
        const salaries = await Salary.find({ teacher: req.user._id }).sort({ year: -1, createdAt: -1 });
        res.json(salaries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Delete an expense
// @route   DELETE /api/finance/expenses/:id
// @access  Private/Admin
export const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) return res.status(404).json({ message: 'Expense record not found' });
        res.json({ message: 'Expense record removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update an expense
// @route   PUT /api/finance/expenses/:id
// @access  Private/Admin
export const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!expense) return res.status(404).json({ message: 'Expense record not found' });
        res.json({ message: 'Expense record updated successfully', expense });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a salary record
// @route   DELETE /api/finance/salaries/:id
// @access  Private/Admin
export const deleteSalary = async (req, res) => {
    try {
        const salary = await Salary.findByIdAndDelete(req.params.id);
        if (!salary) return res.status(404).json({ message: 'Salary record not found' });
        res.json({ message: 'Salary record removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
