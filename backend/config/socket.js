import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';

// Store active users and their socket IDs
const activeUsers = new Map(); // Key: userId (MongoDB ID), Value: socketId

const initSocket = (server) => {
    const io = new Server(server, { 
        cors: { 
            origin: process.env.FRONTEND_URL || 'http://localhost:5173',
            methods: ["GET", "POST"] 
        } 
    });

    // Middleware to authenticate socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error: Token missing'));
        
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Attach user info (userId, role, name)
            socket.user = decoded; 
            next();
        } catch (error) {
            next(new Error('Authentication error: Invalid token'));
        }
    }).on('connection', (socket) => {
        console.log(`[Socket] User connected: ${socket.user.name} (${socket.user.role})`);
        
        // Map userId to socketId
        activeUsers.set(socket.user.userId, socket.id);

        // Admin monitoring room: Admin joins a global room to monitor all chats
        if (socket.user.role === 'admin') {
            socket.join('admin_monitor_room');
        }

        // Handle sending messages
        socket.on('sendMessage', async (data) => {
            const { recipientId, content, attachment } = data;
            
            if (!recipientId || (!content && !attachment)) {
                return socket.emit('chatError', { message: 'Message content or recipient is missing.' });
            }

            try {
                // Ensure recipientId is a string before checking in Map
                const recipientIdString = recipientId.toString();

                const newMessage = new Message({
                    sender: socket.user.userId,
                    recipient: recipientIdString,
                    content: content,
                    attachment: attachment // Assuming attachment is a file path/URL
                });

                await newMessage.save();

                // 1. Emit to the recipient
                const recipientSocketId = activeUsers.get(recipientIdString);
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit('receiveMessage', newMessage);
                }

                // 2. Emit back to the sender (for confirmation/UI update)
                socket.emit('receiveMessage', newMessage);

                // 3. Emit to Admin Monitor Room
                io.to('admin_monitor_room').emit('monitorMessage', newMessage);

            } catch (error) {
                console.error('[Socket Error] Could not save or emit message:', error);
                socket.emit('chatError', { message: 'Failed to send message.' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] User disconnected: ${socket.user.name}`);
            // Remove user from active map
            activeUsers.delete(socket.user.userId);
        });
    });
};

export default initSocket;