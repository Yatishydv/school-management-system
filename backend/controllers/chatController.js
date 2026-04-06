import Message from '../models/Message.js';
import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Class from '../models/Class.js';

// @desc    Get conversation history between two users
// @route   GET /api/chat/:recipientId
// @access  Private (Teacher/Student/Admin)
export const getConversation = async (req, res) => {
    const { recipientId } = req.params;
    const currentUserId = req.user._id;
    const currentUserRole = req.user.role;

    try {
        let messages;

        // Admin monitoring access
        if (currentUserRole === 'admin') {
            // Admin can view any chat by passing two user IDs
            const { user1Id, user2Id } = req.query; 
            if (user1Id && user2Id) {
                messages = await Message.find({
                    $or: [
                        { sender: user1Id, recipient: user2Id },
                        { sender: user2Id, recipient: user1Id }
                    ]
                })
                .populate('sender', 'name uniqueId role')
                .populate('recipient', 'name uniqueId role')
                .sort({ createdAt: 1 });
            } else {
                return res.status(400).json({ message: 'Admin must specify two users (user1Id and user2Id) to monitor a specific chat.' });
            }
        } else {
            // Regular user-to-user chat
            messages = await Message.find({
                $or: [
                    { sender: currentUserId, recipient: recipientId },
                    { sender: recipientId, recipient: currentUserId }
                ]
            })
            .sort({ createdAt: 1 });
        }

        res.status(200).json(messages);

    } catch (error) {
        res.status(500).json({ message: 'Error fetching conversation.', error: error.message });
    }
};

// @desc    Send a message to a user
// @route   POST /api/chat/send
// @access  Private
export const sendMessage = async (req, res) => {
    const { recipientId, content } = req.body;
    const senderId = req.user._id;

    try {
        const message = await Message.create({
            sender: senderId,
            recipient: recipientId,
            content: content,
        });

        // Real-time emission
        const io = req.app.get('socketio');
        io.to(recipientId.toString()).emit('newMessage', message);

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Error sending message.', error: error.message });
    }
};


// @desc    Get list of users available to chat with (e.g., Student finds Teachers, Teacher finds Students)
// @route   GET /api/chat/contacts
// @access  Private (Teacher/Student)
export const getContacts = async (req, res) => {
    const role = req.user.role;
    let contactsQuery;

    if (role === 'teacher') {
        // Teacher can chat with their students
        const teacherClasses = req.user.assignedClasses || [];
        contactsQuery = { role: 'student', classId: { $in: teacherClasses } };
    } else if (role === 'student') {
        // Student can chat with their Class Teacher and Subject Teachers
        const studentClassId = req.user.classId;
        const subjectTeachers = await Subject.find({ classId: studentClassId }).distinct('assignedTeachers');
        
        const classInfo = await Class.findById(studentClassId).select('classTeacher');
        const classTeacherId = classInfo?.classTeacher;

        const teacherIds = [...subjectTeachers.map(id => id.toString()), classTeacherId].filter(Boolean);
        contactsQuery = { _id: { $in: teacherIds }, role: 'teacher' };
    } else if (role === 'admin') {
        // Admin can chat with everyone
        contactsQuery = { role: { $ne: 'admin' } }; 
    }

    try {
        const contacts = await User.find(contactsQuery).select('name uniqueId role profileImage');
        res.status(200).json(contacts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching contacts.' });
    }
};