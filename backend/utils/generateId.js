import User from '../models/User.js';

const generateUniqueId = async (rolePrefix) => {
    // Determine the starting sequence based on the role
    const prefixMap = {
        ADMIN: 'ADM',
        TEACHER: 'TEC',
        STUDENT: 'STU',
    };
    
    const prefix = prefixMap[rolePrefix.toUpperCase()] || 'USR';

    // Find the latest user ID with this prefix to determine the next sequence number
    const latestUser = await User.findOne({ uniqueId: new RegExp(`^${prefix}`) })
        .sort({ uniqueId: -1 })
        .limit(1);

    let nextNumber = 1;

    if (latestUser) {
        const latestId = latestUser.uniqueId;
        // Extract number from the end (e.g., STD0012 -> 12)
        const currentNumber = parseInt(latestId.substring(prefix.length), 10);
        if (!isNaN(currentNumber)) {
            nextNumber = currentNumber + 1;
        }
    }

    // Format the number (e.g., 1 -> 0001)
    const formattedNumber = String(nextNumber).padStart(4, '0');
    
    return `${prefix}${formattedNumber}`;
};

const generateRandomPassword = (length = 12) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
};

export { generateUniqueId, generateRandomPassword };