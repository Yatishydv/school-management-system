import express from 'express';
const router = express.Router();
import { protect } from '../middlewares/authMiddleware.mjs';
import { authorize } from '../middlewares/rbacMiddleware.js';
import {
    getFinancialSummary,
    addExpense,
    getExpenses,
    generateMonthlySalaries,
    getAllSalaries,
    updateSalary,
    getMySalaries,
    deleteExpense,
    updateExpense,
    deleteSalary
} from '../controllers/financeController.js';

// Admin Routes
router.get('/summary', protect, authorize(['admin']), getFinancialSummary);
router.post('/expenses', protect, authorize(['admin']), addExpense);
router.get('/expenses', protect, authorize(['admin']), getExpenses);
router.put('/expenses/:id', protect, authorize(['admin']), updateExpense);
router.delete('/expenses/:id', protect, authorize(['admin']), deleteExpense);
router.post('/salaries/generate', protect, authorize(['admin']), generateMonthlySalaries);
router.get('/salaries', protect, authorize(['admin']), getAllSalaries);
router.put('/salaries/:id', protect, authorize(['admin']), updateSalary);
router.delete('/salaries/:id', protect, authorize(['admin']), deleteSalary);

// Teacher Routes
router.get('/my-salaries', protect, authorize(['teacher']), getMySalaries);

export default router;
