import dotenv from "dotenv";

// Always load .env from backend root
dotenv.config({ path: "./.env" });

// Log to confirm env was loaded
console.log("Loaded ENV → JWT_SECRET:", process.env.JWT_SECRET);

if (!process.env.JWT_SECRET) {
  console.error("❌ CRITICAL ERROR: JWT_SECRET missing in .env");
}

export const PORT = process.env.PORT;
export const MONGODB_URI = process.env.MONGODB_URI;
export const JWT_SECRET = process.env.JWT_SECRET;
export const FRONTEND_URL = process.env.FRONTEND_URL;
