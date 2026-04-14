
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config({ path: "./.env" });

const DB_NAME = "school";

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: DB_NAME,
    });

    const users = await User.find({}, { uniqueId: 1, role: 1, name: 1 });
    console.log("USERS IN DATABASE:");
    console.table(users.map(u => ({ name: u.name, uniqueId: u.uniqueId, role: u.role })));
    
    process.exit();
  } catch (err) {
    console.error("ERROR checking users:", err);
    process.exit(1);
  }
};

checkUsers();
