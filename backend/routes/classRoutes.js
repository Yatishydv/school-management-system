import express from 'express';
const router = express.Router();
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';
import {
    createClass,
    getAllClasses,
    getClassById,
    updateClass,
    deleteClass,
} from '../controllers/classController.js';

router.use(protect);
router.use(authorize(['admin']));

router.route('/').post(createClass).get(getAllClasses);
router.route('/:id').get(getClassById).put(updateClass).delete(deleteClass);

export default router;
