import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define storage location and file naming
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', '..', 'uploads', file.fieldname);
        // Create directory if it doesn't exist
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${Date.now()}${ext}`);
    }
});

// File filter to restrict file types
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'profileImage') {
        if (file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed for profile pictures!'), false);
        }
    } else if (file.fieldname === 'studyMaterial' || file.fieldname === 'assignmentFile') {
        if (file.mimetype.match(/pdf|image|video|application\/vnd\.openxmlformats-officedocument/)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type for documents/materials.'), false);
        }
    } else {
        cb(null, true); // Allow other types by default
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB limit 
});

export default upload;