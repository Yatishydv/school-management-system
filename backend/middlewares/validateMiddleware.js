import { z } from 'zod';

// --- Schemas ---

const userSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters."),
    email: z.string().email("Invalid email format.").optional().nullable(),
    password: z.string().min(6, "Password must be at least 6 characters."),
    role: z.enum(['teacher', 'student'], { required_error: "Role is required." }),
    classId: z.string().optional().nullable(), // Mongoose ObjectId string
    rollNumber: z.string().optional().nullable(),
});

const classSchema = z.object({
    name: z.string().min(1, "Class name is required."),
    sections: z.array(z.string().min(1)),
    classTeacherId: z.string().optional().nullable(),
});


// --- Middleware Function ---

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            const issues = error.errors.map(err => ({
                path: err.path.join('.'),
                message: err.message,
            }));
            return res.status(400).json({ message: 'Validation failed.', issues });
        }
        res.status(500).json({ message: 'Internal validation error.' });
    }
};

export { 
    validate, 
    userSchema, 
    classSchema 
};