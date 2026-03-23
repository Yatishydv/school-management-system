import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

// Force your database name
const DB_NAME = "school";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: DB_NAME,
    });
    console.log(`MongoDB Connected → ${conn.connection.name}`);
  } catch (error) {
    console.error("Database Connection Failed:", error);
    process.exit(1);
  }
};

export default connectDB;
