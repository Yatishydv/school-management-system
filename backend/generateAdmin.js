// backend/generateAdmin.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config({ path: "./.env" });

const DB_NAME = "school";

const createAdmin = async () => {
  try {
    console.log("Connecting to:", process.env.MONGODB_URI);

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: DB_NAME,
    });

    console.log("Connected to MongoDB Atlas!");

    const uniqueId = "admin001";
    const password = "123456"; // plain password (model will hash)

    // Remove old admin if exists
    await User.deleteOne({ uniqueId });

    // Create the new admin
    const admin = await User.create({
      name: "Super Admin",
      email: "admin@school.com",
      uniqueId,
      password,       // IMPORTANT: your model will hash this
      role: "admin",
      phone: "",
      address: "",
      profileImage: ""
    });

    console.log("\n--- SUPER ADMIN CREATED SUCCESSFULLY ---");
    console.log("LOGIN DETAILS:");
    console.log("Unique ID:", uniqueId);
    console.log("Password:", password);
    console.log("----------------------------------------\n");

    process.exit();
  } catch (err) {
    console.error("ERROR creating admin:", err);
    process.exit(1);
  }
};

createAdmin();
