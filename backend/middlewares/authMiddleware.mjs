// backend/middlewares/authMiddleware.mjs

import jwt from "jsonwebtoken"; // FIXED IMPORT
import User from "../models/User.js";

const protect = async (req, res, next) => {
    let token;

    // Check Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            // Verify JWT
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Load user and attach to req
            req.user = await User.findById(decoded.userId).select("-password");

            if (!req.user) {
                return res.status(401).json({
                    message: "Not authorized — user not found",
                });
            }

            return next();
        } catch (error) {
            console.error("JWT ERROR:", error.message);
            return res.status(401).json({
                message: "Not authorized — invalid token",
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            message: "Not authorized — no token provided",
        });
    }
};

export { protect };
