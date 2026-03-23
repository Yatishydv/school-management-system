import express from 'express';
const router = express.Router();
import { protect } from '../middlewares/authMiddleware.mjs';
import { getConversation, getContacts, sendMessage } from '../controllers/chatController.js';

router.use(protect); // All chat routes require authentication

// Get contacts available for chat
router.get('/contacts', getContacts);

// Get conversation history with a specific user
router.get('/:recipientId', getConversation);

// Send a message
router.post('/send', sendMessage);

export default router;