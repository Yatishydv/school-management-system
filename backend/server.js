import "./config/env.js";

import express from "express";
import { fileURLToPath } from 'url';
import path from 'path';
import http from 'http';
import cors from 'cors';

import connectDB from "./config/db.js";
import initSocket from "./config/socket.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import classRoutes from "./routes/classRoutes.js";
import admissionRoutes from "./routes/admissionRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Database connect
connectDB();

// Socket.io init
initSocket(server);

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/classes", classRoutes);
app.use("/api/admissions", admissionRoutes);
app.use("/api/contact", contactRoutes);

app.get("/", (req, res) => {
  res.send("School Management System API is running.");
});

app.get("/api/test-cors", (req, res) => {
  res.json({ message: "CORS test successful!" });
});

// Start server
const PORT = process.env.PORT || 5005;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}.`);
});
