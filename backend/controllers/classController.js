import Class from '../models/Class.js';

// @desc    Create a new class
// @route   POST /api/classes
// @access  Private (Admin)
export const createClass = async (req, res) => {
    const { name, sections, classTeacher } = req.body;

    try {
        const newClass = await Class.create({
            name,
            sections,
            classTeacher,
        });
        res.status(201).json(newClass);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create class', error: error.message });
    }
};

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private (Admin)
export const getAllClasses = async (req, res) => {
    try {
        const classes = await Class.find().populate('classTeacher', 'name uniqueId');
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch classes', error: error.message });
    }
};

// @desc    Get a single class by ID
// @route   GET /api/classes/:id
// @access  Private (Admin)
export const getClassById = async (req, res) => {
    try {
        const singleClass = await Class.findById(req.params.id).populate('classTeacher', 'name uniqueId');
        if (!singleClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        res.status(200).json(singleClass);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch class', error: error.message });
    }
};

// @desc    Update a class
// @route   PUT /api/classes/:id
// @access  Private (Admin)
export const updateClass = async (req, res) => {
    try {
        const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!updatedClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        res.status(200).json(updatedClass);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update class', error: error.message });
    }
};

// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Private (Admin)
export const deleteClass = async (req, res) => {
    try {
        const deletedClass = await Class.findByIdAndDelete(req.params.id);
        if (!deletedClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        res.status(200).json({ message: 'Class deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete class', error: error.message });
    }
};
