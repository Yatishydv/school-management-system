import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';
import Fee from '../models/Fee.js';
import Timetable from '../models/Timetable.js';
import Notice from '../models/Notice.js';
import Gallery from '../models/Gallery.js';
import Exam from '../models/Exam.js';
import Admission from '../models/Admission.js';
import Notification from '../models/Notification.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { generateUniqueId, generateRandomPassword } from '../utils/generateId.js';
import { sendEmail } from '../utils/email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.join(__dirname, '..');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
    try {
        const students = await User.countDocuments({ role: 'student' });
        const teachers = await User.countDocuments({ role: 'teacher' });
        const classes = await Class.countDocuments();
        
        // Calculate Total Pending Dues (Amount Due - Amount Paid)
        const allFees = await Fee.find({ status: { $ne: 'Paid' } });
        const totalPendingAmount = allFees.reduce((acc, f) => acc + (f.amountDue - (f.amountPaid || 0)), 0);
        
        const galleryCount = await Gallery.countDocuments();

        // Calculate Monthly Registrations (Last 6 Months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);

        const registrations = await User.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        year: { $year: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthlyRegistrations = registrations.map(r => ({
            month: monthNames[r._id.month - 1],
            count: r.count
        }));

        res.status(200).json({
            students,
            teachers,
            classes,
            pendingFees: totalPendingAmount,
            galleryCount,
            monthlyRegistrations
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching dashboard stats.', error: error.message });
    }
};


// --- User Management ---

// @desc    Get all users (with optional role filter)
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const query = role ? { role } : {};
        const users = await User.find(query)
            .populate('classId', 'name stream')
            .select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching users.', error: error.message });
    }
};

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('classId', 'name stream')
            .select('-password');
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching user.', error: error.message });
    }
};

// @desc    Add a new user
// @route   POST /api/admin/users
// @access  Private (Admin)
const addUser = async (req, res) => {
    const { 
        name, email, password, role, classId, uniqueId: providedId, phone, address, 
        rollNumber, assignedClasses, fatherName, motherName, dob, prevSchool,
        admissionId, gender, religion, category, aadharNumber, emergencyContact,
        qualification, experience, bio, personalEmail, secondaryPhone, socialLinks
    } = req.body;

    try {
        // Check if user already exists by uniqueId or email
        if (providedId) {
            const idExists = await User.findOne({ uniqueId: providedId });
            if (idExists) return res.status(400).json({ message: 'User with that ID already exists.' });
        }

        if (email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) return res.status(400).json({ message: 'User with that email already exists.' });
        }

        // Use provided uniqueId or generate one
        let finalUniqueId = providedId;
        if (providedId) {
            const rolePrefixMap = { student: 'STU', teacher: 'TEC', admin: 'ADM' };
            const prefix = rolePrefixMap[role];
            if (prefix && !providedId.startsWith(prefix)) {
                finalUniqueId = `${prefix}${providedId.replace(/^(STU|TEC|ADM)/, "").padStart(4, '0')}`;
            }
        } else {
            finalUniqueId = await generateUniqueId(role);
        }

        // Use provided password or generate random
        const userPassword = (password && password.trim() !== "") ? password : generateRandomPassword();

        // Profile image handling
        let profileImageUrl = undefined;
        if (req.file) {
            profileImageUrl = path.relative(backendRoot, req.file.path).replace(/\\/g, '/');
        }

        const classesInput = assignedClasses || req.body['assignedClasses[]'];
        const finalAssignedClasses = (classesInput && Array.isArray(classesInput)) 
            ? classesInput 
            : (classesInput && typeof classesInput === 'string' ? [classesInput] : []);

        console.log("CREATING USER - ID:", finalUniqueId, "PWD_LEN:", userPassword?.length);

        const newUser = await User.create({
            name,
            email: email || undefined,
            password: userPassword, // Model hashes this in pre-save
            role,
            uniqueId: finalUniqueId,
            phone,
            address,
            profileImage: profileImageUrl,
            classId: (role === 'student' && classId && classId !== "") ? classId : undefined,
            rollNumber: role === 'student' ? rollNumber : undefined,
            assignedClasses: role === 'teacher' ? finalAssignedClasses : undefined,
            fatherName: role === 'student' ? fatherName : undefined,
            motherName: role === 'student' ? motherName : undefined,
            dob: role === 'student' ? dob : undefined,
            prevSchool: role === 'student' ? prevSchool : undefined,
            admissionDate: role === 'student' ? new Date() : undefined,
            gender,
            religion,
            category,
            aadharNumber,
            emergencyContact,
            qualification,
            experience,
            bio,
            personalEmail,
            secondaryPhone,
            socialLinks: (typeof socialLinks === 'string') ? JSON.parse(socialLinks) : socialLinks
        });

        if (newUser) {
            // Send welcome email if no password was provided
            if (!password && email) {
                const emailSubject = 'Welcome to School Management System - Account Details';
                const emailHtml = `
                    <p>Dear ${name},</p>
                    <p>Your institutional account has been created.</p>
                    <ul>
                        <li><strong>User ID:</strong> ${finalUniqueId}</li>
                        <li><strong>Password:</strong> ${userPassword}</li>
                    </ul>
                `;
                await sendEmail(email, emailSubject, emailHtml);
            }

            // --- Admission Sync Logic ---
            if (role === 'student') {
                if (admissionId) {
                    // Update existing application
                    await Admission.findByIdAndUpdate(admissionId, { status: 'Admitted' });
                } else {
                    // Create manual admission record to satisfy institutional archive
                    await Admission.create({
                        studentName: name,
                        fatherName: fatherName || 'Not Provided',
                        motherName: motherName || 'Not Provided',
                        dob: dob || new Date().toISOString().split('T')[0],
                        classApplied: 'Direct Admission', // Or try to find class name if needed
                        phone: phone || '0000000000',
                        email: email || undefined,
                        address: address || 'Manual Entry',
                        prevSchool: prevSchool || 'N/A',
                        status: 'Admitted'
                    });
                }
            }

            res.status(201).json({
                message: 'User added successfully.',
                user: newUser,
            });
        }
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Server error during user creation.', error: error.message });
    }
};

// @desc    Bulk Add new users
// @route   POST /api/admin/users/bulk
// @access  Private (Admin)
const addUsersBulk = async (req, res) => {
    const { users } = req.body;
    
    if (!users || !Array.isArray(users) || users.length === 0) {
        return res.status(400).json({ message: 'No users provided.' });
    }
    
    try {
        const results = { successful: 0, failed: 0, errors: [] };
        
        // Ensure classes lookup if class string is provided
        const classDb = await Class.find({});
        const classNameToIdMap = {};
        classDb.forEach(c => {
            // Map by "name" AND "name (stream)" to account for duplicate names
            classNameToIdMap[c.name.toLowerCase()] = c._id.toString(); 
            classNameToIdMap[`${c.name.toLowerCase()} (${c.stream.toLowerCase()})`] = c._id.toString();
        });
        
        // Process sequentially to avoid race conditions (like unique ID generation and duplicate checking)
        for (const [index, userData] of users.entries()) {
            try {
                let {
                    name, email, password, role, classId, uniqueId: providedId, phone, address, 
                    rollNumber, fatherName, motherName, dob, prevSchool, Class: classNameStr
                } = userData;
                
                if (!name || name.trim() === '') {
                    throw new Error(`Row ${index + 2}: Name is required.`);
                }
                if (!role || role.trim() === '') {
                    role = 'student'; // Default to student
                }
                
                // If the user provided a "Class" string name but no classId, try to map it
                if (!classId && classNameStr && role === 'student') {
                     const matchedId = classNameToIdMap[classNameStr.trim().toLowerCase()];
                     if (matchedId) {
                         classId = matchedId;
                     }
                }

                // Check for duplicates
                if (providedId) {
                    const idExists = await User.findOne({ uniqueId: providedId });
                    if (idExists) throw new Error(`Row ${index + 2}: User ID ${providedId} already exists.`);
                }
                if (email) {
                    const emailExists = await User.findOne({ email });
                    if (emailExists) throw new Error(`Row ${index + 2}: Email ${email} already exists.`);
                }

                let finalUniqueId = providedId;
                if (!providedId) {
                    finalUniqueId = await generateUniqueId(role);
                }

                const userPassword = (password && password.trim() !== "") ? password.trim() : generateRandomPassword();

                const newUser = await User.create({
                    name,
                    email: email || undefined,
                    password: userPassword,
                    role,
                    uniqueId: finalUniqueId,
                    phone: phone || undefined,
                    address: address || undefined,
                    classId: (role === 'student' && classId) ? classId : undefined,
                    rollNumber: role === 'student' ? rollNumber : undefined,
                    fatherName: role === 'student' ? fatherName : undefined,
                    motherName: role === 'student' ? motherName : undefined,
                    dob: role === 'student' ? dob : undefined,
                    prevSchool: role === 'student' ? prevSchool : undefined,
                    admissionDate: role === 'student' ? new Date() : undefined,
                    gender: userData.Gender || userData.gender,
                    religion: userData.Religion || userData.religion,
                    category: userData.Category || userData.category,
                    aadharNumber: userData["Aadhar Number"] || userData.aadharNumber,
                    emergencyContact: userData["Emergency Contact"] || userData.emergencyContact,
                    qualification: userData.Qualification || userData.qualification,
                    experience: userData.Experience || userData.experience,
                    bio: userData.Bio || userData.bio,
                    personalEmail: userData["Personal Email"] || userData.personalEmail,
                    secondaryPhone: userData["Secondary Phone"] || userData.secondaryPhone,
                    socialLinks: userData.socialLinks || {
                        whatsapp: userData.WhatsApp,
                        instagram: userData.Instagram,
                        facebook: userData.Facebook,
                        twitter: userData.Twitter
                    }
                });

                if (newUser && !password && email) {
                    const emailSubject = 'Welcome to School Management System - Account Details';
                    const emailHtml = `
                        <p>Dear ${name},</p>
                        <p>Your institutional account has been created via bulk import.</p>
                        <ul>
                            <li><strong>User ID:</strong> ${finalUniqueId}</li>
                            <li><strong>Password:</strong> ${userPassword}</li>
                        </ul>
                    `;
                    // Send email but don't fail the whole process if email fails
                    sendEmail(email, emailSubject, emailHtml).catch(e => console.error('Bulk Email error:', e));
                }
                results.successful++;
            } catch (err) {
                results.failed++;
                results.errors.push(err.message);
            }
        }

        res.status(200).json({ 
            message: `Bulk import completed. Skipped ${results.failed} errors.`, 
            results 
        });
        
    } catch (error) {
        console.error('Error in bulk user import:', error);
        res.status(500).json({ message: 'Server error during bulk import.', error: error.message });
    }
};

const updateUser = async (req, res) => {
    const { 
        name, email, password, role, classId, uniqueId, phone, address, 
        rollNumber, assignedClasses, fatherName, motherName, dob, prevSchool,
        gender, religion, category, aadharNumber, emergencyContact,
        qualification, experience, bio, personalEmail, secondaryPhone, socialLinks
    } = req.body;

    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Update common fields if provided, otherwise keep existing
            if (name !== undefined) user.name = name;
            if (email !== undefined) user.email = email;
            if (phone !== undefined) user.phone = phone;
            if (address !== undefined) user.address = address;
            if (uniqueId !== undefined) user.uniqueId = uniqueId;
            if (password !== undefined && password.trim() !== "") user.password = password;

            // Student specific: Allow clearing if empty string is sent, or update if provided
            if (classId !== undefined) {
                // Ensure we only update if it's a valid ID or null
                user.classId = (classId && typeof classId === 'string' && classId.trim() !== "") ? classId : (classId === null ? undefined : user.classId);
            }
            if (rollNumber !== undefined) user.rollNumber = rollNumber;
            if (fatherName !== undefined) user.fatherName = fatherName;
            if (motherName !== undefined) user.motherName = motherName;
            if (dob !== undefined) user.dob = dob;
            if (prevSchool !== undefined) user.prevSchool = prevSchool;

            // Updated Fields
            if (gender !== undefined) user.gender = gender;
            if (religion !== undefined) user.religion = religion;
            if (category !== undefined) user.category = category;
            if (aadharNumber !== undefined) user.aadharNumber = aadharNumber;
            if (emergencyContact !== undefined) user.emergencyContact = emergencyContact;
            if (qualification !== undefined) user.qualification = qualification;
            if (experience !== undefined) user.experience = experience;
            if (bio !== undefined) user.bio = bio;
            if (personalEmail !== undefined) user.personalEmail = personalEmail;
            if (secondaryPhone !== undefined) user.secondaryPhone = secondaryPhone;
            if (socialLinks !== undefined) {
                user.socialLinks = (typeof socialLinks === 'string') ? JSON.parse(socialLinks) : socialLinks;
            }

            // Teacher specific
            const classesInput = assignedClasses || req.body['assignedClasses[]'];
            if (classesInput !== undefined) {
                user.assignedClasses = (classesInput && Array.isArray(classesInput)) 
                    ? classesInput.filter(c => c && c.trim() !== "") 
                    : (classesInput && typeof classesInput === 'string' ? [classesInput] : []);
            }

            // Profile Image update
            if (req.file) {
                user.profileImage = path.relative(backendRoot, req.file.path).replace(/\\/g, '/');
            }

            const updatedUser = await user.save();

            res.status(200).json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        console.error('Update User Error:', error);
        res.status(500).json({ message: 'Error updating user.', error: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            const userId = user._id;
            const role = user.role;

            // --- Cascade Cleanup for Teachers ---
            if (role === 'teacher') {
                // 1. Remove from all Subject assignedTeachers arrays
                await Subject.updateMany(
                    { assignedTeachers: userId },
                    { $pull: { assignedTeachers: userId } }
                );

                // 2. Remove from all Class classTeacher fields
                await Class.updateMany(
                    { classTeacher: userId },
                    { $set: { classTeacher: null } }
                );

                // 3. Optional: Clear from Timetables
                await Timetable.updateMany(
                    { "schedule.teacher": userId },
                    { $set: { "schedule.$[elem].teacher": null } },
                    { arrayFilters: [{ "elem.teacher": userId }] }
                );
            }

            // --- Cascade Cleanup for Students ---
            if (role === 'student') {
                // We keep their records for archives, but they are no longer reachable by _id in lookups if deleted
            }

            // Cleanup profile image from server
            if (user.profileImage) {
                const fullPath = path.join(backendRoot, user.profileImage);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            }

            await user.deleteOne();
            res.status(200).json({ message: 'User removed and references cleaned up.' });
        } else {
            res.status(404).json({ message: 'User not found.' });
        }
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ message: 'Server error deleting user.', error: error.message });
    }
};

// @desc    Reset user password
// @route   PUT /api/admin/users/:id/reset-password
// @access  Private (Admin)
const resetPassword = async (req, res) => {
    const userId = req.params.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const newGeneratedPassword = generateRandomPassword(); // Generate a new random password

        // Hash the new password and save (User model pre-save hook handles hashing for update)
        user.password = newGeneratedPassword; 
        await user.save(); 

        // Send the new password to the user's email
        const emailSubject = 'Your Password Has Been Reset';
        const emailHtml = `
            <p>Dear ${user.name},</p>
            <p>Your password for the School Management System has been reset.</p>
            <p>Your new password is: <strong>${newGeneratedPassword}</strong></p>
            <p>Please log in with your new password and consider changing it to something memorable.</p>
            <p>Regards,</p>
            <p>School Management System Admin</p>
        `;
        await sendEmail(user.email, emailSubject, emailHtml);

        res.status(200).json({ message: `Password for ${user.uniqueId} reset successfully. New password sent to user's email.` });
    } catch (error) {
        console.error('Error during password reset:', error);
        res.status(500).json({ message: 'Server error during password reset.', error: error.message });
    }
};



// --- Class Management ---

// @desc    Get all classes
// @route   GET /api/admin/classes
// @access  Private (Admin)
const getClasses = async (req, res) => {
    try {
        const classes = await Class.find()
            .populate('classTeacher', 'name uniqueId')
            .sort({ name: 1 });
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching classes.', error: error.message });
    }
};

// @desc    Get specific class details (info, subjects, students)
// @route   GET /api/admin/classes/:id/details
// @access  Private (Admin)
const getClassDetails = async (req, res) => {
    try {
        const classId = req.params.id;
        const [classInfo, subjects, students] = await Promise.all([
            Class.findById(classId).populate('classTeacher', 'name uniqueId'),
            Subject.find({ classId }).populate('assignedTeachers', 'name uniqueId'),
            User.find({ classId, role: 'student' }).select('name uniqueId rollNumber email phone')
        ]);

        if (!classInfo) {
            return res.status(404).json({ message: 'Class not found.' });
        }

        res.status(200).json({
            class: classInfo,
            subjects,
            students
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching class details.', error: error.message });
    }
};

// @desc    Create a new class
// @route   POST /api/admin/classes
// @access  Private (Admin)
const createClass = async (req, res) => {
    const { name, sections, classTeacherId, stream } = req.body;
    
    try {
        const sanitizedSections = sections && sections.length > 0 ? sections.filter(s => s && s.trim() !== "") : [];
        
        const newClass = await Class.create({ 
            name, 
            sections: sanitizedSections, 
            classTeacher: classTeacherId && classTeacherId.trim() !== "" ? classTeacherId : undefined,
            stream: stream || 'General'
        });
        res.status(201).json({ message: 'Class created successfully.', class: newClass });
    } catch (error) {
        res.status(400).json({ message: 'Failed to create class.', error: error.message });
    }
};

// @desc    Bulk Add new classes
// @route   POST /api/admin/classes/bulk
// @access  Private (Admin)
const addClassesBulk = async (req, res) => {
    const { classes } = req.body;
    
    if (!classes || !Array.isArray(classes) || classes.length === 0) {
        return res.status(400).json({ message: 'No classes provided.' });
    }
    
    try {
        const results = { successful: 0, failed: 0, errors: [] };
        
        for (const [index, classData] of classes.entries()) {
            try {
                const { name, stream, sections, classTeacher: teacherStr } = classData;
                if (!name || name.trim() === '') {
                    throw new Error(`Row ${index + 2}: Class Name is required.`);
                }
                
                // Parse sections string if applicable
                let parsedSections = [];
                if (sections) {
                    if (Array.isArray(sections)) {
                        parsedSections = sections;
                    } else if (typeof sections === 'string') {
                        parsedSections = sections.split(',').map(s => s.trim()).filter(s => s !== "");
                    }
                }

                // Resolve Class Teacher (ID or name)
                let classTeacherId = null;
                if (teacherStr && teacherStr.trim() !== '') {
                    const matchedTeacher = await User.findOne({ 
                        role: 'teacher',
                        $or: [
                            { uniqueId: teacherStr.trim() },
                            { name: new RegExp('^' + teacherStr.trim() + '$', 'i') }
                        ]
                    });
                    if (matchedTeacher) classTeacherId = matchedTeacher._id;
                }
                
                const existing = await Class.findOne({ name: name.trim(), stream: stream || 'General' });
                if (existing) {
                    throw new Error(`Row ${index + 2}: Class ${name} (${stream || 'General'}) already exists.`);
                }

                await Class.create({ 
                    name: name.trim(), 
                    sections: parsedSections, 
                    stream: stream || 'General',
                    classTeacher: classTeacherId
                });
                
                results.successful++;
            } catch (err) {
                results.failed++;
                results.errors.push(err.message);
            }
        }

        res.status(200).json({ 
            message: `Bulk class import completed. Skipped ${results.failed} errors.`, 
            results 
        });
        
    } catch (error) {
        console.error('Error in bulk class import:', error);
        res.status(500).json({ message: 'Server error during bulk class import.', error: error.message });
    }
};

// @desc    Delete a class
// @route   DELETE /api/admin/classes/:id
// @access  Private (Admin)
const deleteClass = async (req, res) => {
    try {
        const deletedClass = await Class.findByIdAndDelete(req.params.id);
        if (!deletedClass) {
            return res.status(404).json({ message: 'Class not found.' });
        }
        res.status(200).json({ message: 'Class deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting class.', error: error.message });
    }
};

// @desc    Update a class
// @route   PUT /api/admin/classes/:id
// @access  Private (Admin)
const updateClass = async (req, res) => {
    const { name, sections, classTeacherId, stream } = req.body;
    
    try {
        const cls = await Class.findById(req.params.id);
        if (!cls) return res.status(404).json({ message: "Class not found." });

        if (name !== undefined) cls.name = name;
        if (stream !== undefined) cls.stream = stream;
        
        if (sections !== undefined) {
            cls.sections = sections && sections.length > 0 ? sections.filter(s => s && s.trim() !== "") : [];
        }

        if (classTeacherId !== undefined) {
             cls.classTeacher = classTeacherId && classTeacherId.trim() !== "" ? classTeacherId : null;
        }

        const updatedClass = await cls.save();
        res.status(200).json({ message: 'Class updated successfully.', class: updatedClass });
    } catch (error) {
        res.status(500).json({ message: 'Error updating class.', error: error.message });
    }
};



// --- Subject Management ---

// @desc    Get all subjects
// @route   GET /api/admin/subjects
// @access  Private (Admin)
const getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find()
            .populate('assignedTeachers', 'name uniqueId')
            .populate('classId', 'name stream');
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching subjects.', error: error.message });
    }
};

// @desc    Create a new subject
// @route   POST /api/admin/subjects
// @access  Private (Admin)
const createSubject = async (req, res) => {
    const { name, code, assignedTeacherId, assignedTeacherIds, classId } = req.body;
    
    try {
        const newSubject = await Subject.create({ 
            name, 
            code, 
            assignedTeachers: assignedTeacherIds || (assignedTeacherId ? [assignedTeacherId] : []),
            classId
        });
        res.status(201).json({ message: 'Subject created successfully.', subject: newSubject });
    } catch (error) {
        res.status(400).json({ message: 'Failed to create subject.', error: error.message });
    }
};

// @desc    Bulk Add new subjects
// @route   POST /api/admin/subjects/bulk
// @access  Private (Admin)
const addSubjectsBulk = async (req, res) => {
    const { subjects } = req.body;
    
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
        return res.status(400).json({ message: 'No subjects provided.' });
    }
    
    try {
        const results = { successful: 0, failed: 0, errors: [] };
        
        const classDb = await Class.find({});
        const classNameToIdMap = {};
        classDb.forEach(c => classNameToIdMap[c.name.toLowerCase()] = c._id.toString());
        
        for (const [index, subjectData] of subjects.entries()) {
            try {
                const { name, code, Class: classNameStr, Teachers: teachersStr } = subjectData;
                if (!name || name.trim() === '') throw new Error(`Row ${index + 2}: Subject Name is required.`);
                if (!code || code.trim() === '') throw new Error(`Row ${index + 2}: Subject Code is required.`);
                
                let classId = undefined;
                if (classNameStr) {
                    const matchedId = classNameToIdMap[classNameStr.trim().toLowerCase()];
                    if (!matchedId) {
                        throw new Error(`Row ${index + 2}: Class "${classNameStr}" not found in database.`);
                    }
                    classId = matchedId;
                } else {
                    throw new Error(`Row ${index + 2}: Class is required.`);
                }

                // Resolve Teachers (Comma separated IDs or names)
                let teacherIds = [];
                if (teachersStr) {
                    const teacherArray = (typeof teachersStr === 'string' ? teachersStr.split(',') : [teachersStr]).map(t => t.trim());
                    for (const t of teacherArray) {
                        const matchedT = await User.findOne({
                            role: 'teacher',
                            $or: [
                                { uniqueId: t },
                                { name: new RegExp('^' + t + '$', 'i') }
                            ]
                        });
                        if (matchedT) teacherIds.push(matchedT._id);
                    }
                }
                
                const existing = await Subject.findOne({ code: code.trim(), classId });
                if (existing) throw new Error(`Row ${index + 2}: Subject Code ${code} already exists for this class.`);

                await Subject.create({ 
                    name: name.trim(), 
                    code: code.trim(), 
                    classId,
                    assignedTeachers: teacherIds
                });
                
                results.successful++;
            } catch (err) {
                results.failed++;
                results.errors.push(err.message);
            }
        }

        res.status(200).json({ 
            message: `Bulk subject import completed. Skipped ${results.failed} errors.`, 
            results 
        });
        
    } catch (error) {
        console.error('Error in bulk subject import:', error);
        res.status(500).json({ message: 'Server error during bulk subject import.', error: error.message });
    }
};

// @desc    Delete a subject
// @route   DELETE /api/admin/subjects/:id
// @access  Private (Admin)
const deleteSubject = async (req, res) => {
    try {
        const deletedSubject = await Subject.findByIdAndDelete(req.params.id);
        if (!deletedSubject) {
            return res.status(404).json({ message: 'Subject not found.' });
        }
        res.status(200).json({ message: 'Subject deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting subject.', error: error.message });
    }
};

// @desc    Update a subject
// @route   PUT /api/admin/subjects/:id
// @access  Private (Admin)
const updateSubject = async (req, res) => {
    const { name, code, assignedTeacherId, assignedTeacherIds, classId } = req.body;
    
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) return res.status(404).json({ message: 'Subject not found.' });

        if (name !== undefined) subject.name = name;
        if (code !== undefined) subject.code = code;
        if (classId !== undefined) subject.classId = classId;
        
        if (assignedTeacherIds !== undefined) {
             subject.assignedTeachers = assignedTeacherIds;
        } else if (assignedTeacherId !== undefined) {
             subject.assignedTeachers = [assignedTeacherId];
        }

        const updatedSubject = await subject.save();
        res.status(200).json({ message: 'Subject updated successfully.', subject: updatedSubject });
    } catch (error) {
        res.status(500).json({ message: 'Error updating subject.', error: error.message });
    }
};


// --- Timetable Management ---

// @desc    Create/Update class timetable
// @route   POST /api/admin/timetable
// @access  Private (Admin)
const manageTimetable = async (req, res) => {
    const { classId, schedule } = req.body; 

    try {
        // Validation: Ensure all schedule items have a subject
        if (schedule.some(s => !s.subject || s.subject === "")) {
            return res.status(400).json({ message: 'All scheduled slots must have a valid subject axis.' });
        }

        const timetable = await Timetable.findOneAndUpdate(
            { class: classId },
            { class: classId, schedule },
            { upsert: true, new: true }
        ).populate({
            path: 'schedule.subject',
            select: 'name code'
        }).populate({
            path: 'schedule.teacher',
            select: 'name email role'
        });

        res.status(200).json({ message: 'Timetable updated successfully.', timetable });
    } catch (error) {
        res.status(500).json({ message: 'Error managing timetable.', error: error.message });
    }
};

const getTimetable = async (req, res) => {
    try {
        const { classId } = req.params;
        const timetable = await Timetable.findOne({ class: classId })
            .populate('schedule.subject', 'name code')
            .populate('schedule.teacher', 'name email role');
        
        if (!timetable) {
            return res.status(200).json({ schedule: [] });
        }
        res.status(200).json(timetable);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching timetable.', error: error.message });
    }
};


// --- Fees Management ---

// @desc    Create/Assign new fees
// @route   POST /api/admin/fees
// @access  Private (Admin)
const createFee = async (req, res) => {
    const { targetType, targetId, title, amountDue, dueDate } = req.body;

    try {
        let students = [];
        if (targetType === 'Class') {
            students = await User.find({ classId: targetId, role: 'student' });
        } else {
            // Handle both MongoDB _id and Institutional uniqueId
            students = await User.find({ 
                $or: [
                    { _id: mongoose.Types.ObjectId.isValid(targetId) ? targetId : null },
                    { uniqueId: targetId }
                ],
                role: 'student' 
            });
        }

        if (students.length === 0) {
            return res.status(404).json({ message: 'No students found for fee assignment.' });
        }

        const feeRecords = students.map(s => ({
            student: s._id,
            title: (title && title.trim() !== "") ? title.trim() : 'Academic Fee',
            amountDue: Number(amountDue),
            dueDate: new Date(dueDate),
            status: 'Pending',
            auditLog: [{
                action: 'Fee Issued',
                details: `Initial fee assigned`,
                modifiedBy: req.user?._id
            }]
        }));

        await Fee.insertMany(feeRecords);
        res.status(201).json({ message: `Fees assigned to ${students.length} students.` });
    } catch (error) {
        res.status(500).json({ message: 'Error assigning fees.', error: error.message });
    }
};

// @desc    Get all fee records
// @route   GET /api/admin/fees
// @access  Private (Admin)
const getFeeRecords = async (req, res) => {
    try {
        const fees = await Fee.find()
            .populate({
                path: 'student',
                select: 'name uniqueId rollNumber',
                populate: { path: 'classId', select: 'name stream' }
            })
            .sort({ createdAt: -1 });
        
        // Simple analytics
        const totalPending = fees.filter(f => f.status !== 'Paid').reduce((acc, f) => acc + (f.amountDue - f.amountPaid), 0);
        const totalCollected = fees.reduce((acc, f) => acc + f.amountPaid, 0);

        res.status(200).json({ fees, analytics: { totalPending, totalCollected } });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching fee records.', error: error.message });
    }
};

// @desc    Record a new fee payment
// @route   POST /api/admin/fees/:id/payment
// @access  Private (Admin)
const recordPayment = async (req, res) => {
    const feeId = req.params.id;
    const { amount, method, remarks } = req.body;
    const paymentAmount = Number(amount);

    try {
        const fee = await Fee.findById(feeId);
        if (!fee) return res.status(404).json({ message: 'Fee record not found.' });

        const newAmountPaid = Number(fee.amountPaid || 0) + paymentAmount;
        
        fee.amountPaid = newAmountPaid;
        fee.paymentHistory.push({ amount: paymentAmount, method, remarks });
        
        if (newAmountPaid >= fee.amountDue) {
            fee.status = 'Paid';
        } else if (newAmountPaid > 0) {
            fee.status = 'Partial';
        }

        await fee.save();
        res.status(200).json({ message: 'Payment recorded successfully.', fee });

    } catch (error) {
        res.status(500).json({ message: 'Error recording payment.', error: error.message });
    }
};

// @desc    Update a fee
// @route   PUT /api/admin/fees/:id
// @access  Private (Admin)
const updateFee = async (req, res) => {
    const feeId = req.params.id;
    const { title, amountDue, dueDate } = req.body;
    
    try {
        const fee = await Fee.findById(feeId);
        if (!fee) return res.status(404).json({ message: 'Fee not found.' });

        const newAmount = Number(amountDue);
        if (newAmount < fee.amountPaid) {
            return res.status(400).json({ message: 'New amount due cannot be less than the amount already paid.' });
        }

        const changes = [];
        if (title && title.trim() !== fee.title) {
            changes.push(`Title from "${fee.title}" to "${title.trim()}"`);
            fee.title = title.trim();
        }
        if (amountDue && newAmount !== fee.amountDue) {
            changes.push(`Amount from ₹${fee.amountDue} to ₹${newAmount}`);
            fee.amountDue = newAmount;
        }
        
        const newDate = new Date(dueDate);
        const oldDate = new Date(fee.dueDate);
        if (dueDate && newDate.toISOString().split('T')[0] !== oldDate.toISOString().split('T')[0]) {
            changes.push(`Due date from ${oldDate.toLocaleDateString()} to ${newDate.toLocaleDateString()}`);
            fee.dueDate = newDate;
        }

        if (changes.length > 0) {
            fee.auditLog.push({
                action: 'Fee Edited',
                details: changes.join(', '),
                modifiedBy: req.user?._id
            });
            
            // Re-evaluate status
            if (fee.amountPaid >= fee.amountDue) {
                fee.status = 'Paid';
            } else if (fee.amountPaid > 0) {
                fee.status = 'Partial';
            } else if (new Date() > new Date(fee.dueDate)) {
                fee.status = 'Overdue';
            } else {
                fee.status = 'Pending';
            }

            await fee.save();
        }

        res.status(200).json({ message: 'Fee updated successfully.', fee });
    } catch (error) {
        res.status(500).json({ message: 'Error updating fee.', error: error.message });
    }
};

// @desc    Delete a fee
// @route   DELETE /api/admin/fees/:id
// @access  Private (Admin)
const deleteFee = async (req, res) => {
    const feeId = req.params.id;
    
    try {
        const fee = await Fee.findByIdAndDelete(feeId);
        if (!fee) return res.status(404).json({ message: 'Fee not found.' });
        
        res.status(200).json({ message: 'Fee deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting fee.', error: error.message });
    }
};

// @desc    Bulk Delete fees
// @route   POST /api/admin/fees/bulk-delete
// @access  Private (Admin)
const deleteFeesBulk = async (req, res) => {
    const { feeIds } = req.body;
    
    if (!feeIds || !Array.isArray(feeIds) || feeIds.length === 0) {
        return res.status(400).json({ message: 'No fee IDs provided for deletion.' });
    }

    try {
        const result = await Fee.deleteMany({ _id: { $in: feeIds } });
        res.status(200).json({ 
            message: `Successfully deleted ${result.deletedCount} fee records.`,
            deletedCount: result.deletedCount 
        });
    } catch (error) {
        res.status(500).json({ message: 'Error during bulk fee deletion.', error: error.message });
    }
};

// --- Notice & Event Management ---

// @desc    Get all notices
// @route   GET /api/admin/notices
// @access  Private (Admin)
const getNotices = async (req, res) => {
    try {
        const notices = await Notice.find()
            .populate('author', 'name')
            .populate('targetClass', 'name')
            .sort({ date: -1 });
        res.status(200).json(notices);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notices.', error: error.message });
    }
};


// @desc    Create a new notice or event
// @route   POST /api/admin/notices
// @access  Private (Admin)
const createNotice = async (req, res) => {
    const { title, content, targetAudience, classId } = req.body;
    try {
        const newNotice = await Notice.create({
            title,
            content,
            author: req.user._id,
            targetAudience,
            classId: targetAudience === 'Specific Class' ? classId : null,
        });
        res.status(201).json({ message: 'Notice posted successfully.', notice: newNotice });
    } catch (error) {
        res.status(500).json({ message: 'Error posting notice.', error: error.message });
    }
};

// @desc    Delete a notice
// @route   DELETE /api/admin/notices/:id
// @access  Private (Admin)
const deleteNotice = async (req, res) => {
    try {
        const notice = await Notice.findByIdAndDelete(req.params.id);
        if (!notice) {
            return res.status(404).json({ message: 'Notice not found.' });
        }
        res.status(200).json({ message: 'Notice deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notice.', error: error.message });
    }
};


// --- Gallery Management ---

// @desc    Get all gallery images
// @route   GET /api/admin/gallery
// @access  Private (Admin)
const getGalleryImages = async (req, res) => {
    try {
        const images = await Gallery.find().sort({ uploadedAt: -1 });
        res.status(200).json(images);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching gallery images.', error: error.message });
    }
};


// @desc    Upload image to gallery
// @route   POST /api/admin/gallery
// @access  Private (Admin)
const uploadGalleryImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image file provided." });
    }

    const { title, caption, keywords, tags } = req.body;

    try {
        // Convert absolute path to relative path for URL
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        const backendRoot = path.join(__dirname, '..');
        const relativeUrl = path.relative(backendRoot, req.file.path).replace(/\\/g, '/');

        const newImage = await Gallery.create({
            title: title || 'School Event Photo',
            caption: caption || '',
            url: relativeUrl,
            keywords: keywords ? (Array.isArray(keywords) ? keywords : keywords.split(',').map(k => k.trim())) : [],
            tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
            uploadedBy: req.user._id
        });
        res.status(201).json({ message: 'Image uploaded to gallery.', image: newImage });
    } catch (error) {
        console.error('Gallery Upload Error:', error);
        res.status(500).json({ message: 'Error uploading image.', error: error.message });
    }
};

// @desc    Delete a gallery image
// @route   DELETE /api/admin/gallery/:id
// @access  Private (Admin)
const deleteGalleryImage = async (req, res) => {
    try {
        const image = await Gallery.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found.' });
        }

        // Delete the actual file from the server
        const fullPath = path.join(backendRoot, image.url);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }

        await Gallery.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Image record and file deleted successfully.' });
    } catch (error) {
        console.error('Delete Gallery Error:', error);
        res.status(500).json({ message: 'Error deleting image.', error: error.message });
    }
};



// --- Examination Hub ---

// @desc    Get all scheduled exams
// @route   GET /api/admin/exams
// @access  Private (Admin)
const getExams = async (req, res) => {
    try {
        const exams = await Exam.find()
            .populate('classId', 'name stream')
            .populate('subjectId', 'name')
            .populate('teacherId', 'name')
            .sort({ date: 1 });
        res.status(200).json(exams);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exams.', error: error.message });
    }
};

// @desc    Schedule a new exam
// @route   POST /api/admin/exams
// @access  Private (Admin)
const createExam = async (req, res) => {
    const { title, classId, subjectId, teacherId, date, startTime, endTime, totalMarks, passingMarks, room } = req.body;
    try {
        const exam = await Exam.create({
            title, classId, subjectId, teacherId, date, startTime, endTime, totalMarks, passingMarks, room
        });
        res.status(201).json({ message: 'Exam scheduled successfully.', exam });
    } catch (error) {
        res.status(400).json({ message: 'Failed to schedule exam.', error: error.message });
    }
};

// @desc    Delete an exam
// @route   DELETE /api/admin/exams/:id
// @access  Private (Admin)
const deleteExam = async (req, res) => {
    try {
        const exam = await Exam.findByIdAndDelete(req.params.id);
        if (!exam) return res.status(404).json({ message: 'Exam not found.' });
        res.status(200).json({ message: 'Exam cancelled successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling exam.', error: error.message });
    }
};

// --- Notification Management ---

// @desc    Send a notification (Admin)
// @route   POST /api/admin/notifications
// @access  Private (Admin)
const sendNotification = async (req, res) => {
    const { title, message, targetType, targetId } = req.body;
    try {
        const newNotification = await Notification.create({
            title,
            message,
            sender: req.user._id,
            targetType,
            targetId: ['Class', 'User'].includes(targetType) ? targetId : null,
            modelRef: targetType === 'Class' ? 'Class' : (targetType === 'User' ? 'User' : undefined)
        });
        res.status(201).json({ message: 'Notification deployed successfully.', notification: newNotification });
    } catch (error) {
        res.status(500).json({ message: 'Error deploying notification.', error: error.message });
    }
};

// @desc    Get sent notifications history
// @route   GET /api/admin/notifications
// @access  Private (Admin)
const getSentNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ sender: req.user._id })
            .populate('targetId', 'name uniqueId')
            .sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notification history.', error: error.message });
    }
};

// @desc    Delete a notification
// @route   DELETE /api/admin/notifications/:id
// @access  Private (Admin)
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ message: 'Notification not found.' });
        if (notification.sender.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this alert.' });
        }
        await Notification.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Alert permanently removed from history.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting alert.', error: error.message });
    }
};

// @desc    Enroll existing students to a class (with Roll Numbers)
// @route   POST /api/admin/users/enroll
// @access  Private (Admin)
const enrollStudents = async (req, res) => {
    const { enrollmentData, classId } = req.body; // enrollmentData: [{ id, rollNumber }]
    try {
        if (!enrollmentData || !Array.isArray(enrollmentData) || !classId) {
            return res.status(400).json({ message: 'Missing enrollmentData (array) or classId.' });
        }

        const updatePromises = enrollmentData.map(item => 
            User.updateOne(
                { _id: item.id, role: 'student' },
                { $set: { classId, rollNumber: item.rollNumber } }
            )
        );

        const results = await Promise.all(updatePromises);
        const modifiedCount = results.reduce((acc, curr) => acc + curr.modifiedCount, 0);

        res.status(200).json({ 
            message: 'Enrollment successful with attributes updated.', 
            processedCount: enrollmentData.length,
            modifiedCount 
        });
    } catch (error) {
        console.error('Enroll Students Error:', error);
        res.status(500).json({ message: 'Error enrolling students.', error: error.message });
    }
};

export {
    getDashboardStats,
    getUsers,
    getUserById,
    addUser,
    updateUser,
    deleteUser,
    resetPassword,
    enrollStudents,
    getClasses,
    getClassDetails,
    createClass,
    updateClass,
    deleteClass,
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    manageTimetable,
    getTimetable,
    createFee,
    getFeeRecords,
    recordPayment,
    updateFee,
    deleteFee,
    deleteFeesBulk,
    getNotices,
    createNotice,
    deleteNotice,
    getGalleryImages,
    uploadGalleryImage,
    deleteGalleryImage,
    getExams,
    createExam,
    deleteExam,
    addUsersBulk,
    addClassesBulk,
    addSubjectsBulk,
    sendNotification,
    getSentNotifications,
    deleteNotification
};