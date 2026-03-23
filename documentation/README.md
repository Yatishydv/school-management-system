# School Management System

This is a comprehensive school management system with a backend built with Node.js, Express, and MongoDB, and a frontend built with React.

## Features

### Backend

*   **Authentication:** JWT-based authentication for admins, teachers, and students.
*   **Role-Based Access Control (RBAC):** Middleware to protect routes based on user roles.
*   **User Management:** Admins can add, update, delete, and manage users (teachers and students).
*   **Class and Subject Management:** Admins can create, update, and delete classes and subjects.
*   **Timetable Management:** Admins can create and manage class timetables.
*   **Fee Management:** Admins can manage student fees and record payments.
*   **Notice and Event Management:** Admins can post notices and events for different audiences.
*   **Gallery Management:** Admins can upload and manage school gallery images.
*   **Assignments:** Teachers can create assignments, and students can submit them.
*   **Grading:** Teachers can grade student submissions.
*   **Chat:** Real-time chat functionality between users with Socket.IO.
*   **File Uploads:** File uploads for assignments, profile pictures, and gallery images with Multer.
*   **Validation:** Data validation with Zod.

### Frontend

*   **Admin Dashboard:** A dashboard for admins to manage the entire system.
*   **Teacher Dashboard:** A dashboard for teachers to manage their classes, assignments, and students.
*   **Student Dashboard:** A dashboard for students to view their timetable, assignments, fees, and notices.
*   **Public Website:** A public-facing website with information about the school, notices, and gallery.
*   **Login:** A login page for all users.
*   **Chat Interface:** A chat interface for real-time communication.

## Installation

### Prerequisites

*   Node.js
*   MongoDB

### Backend

1.  Navigate to the `backend` directory.
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend` directory and add the following environment variables:
    ```
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/school-management-system
    JWT_SECRET=your_jwt_secret
    FRONTEND_URL=http://localhost:5173
    EMAIL_USER=your_email@example.com
    EMAIL_PASS=your_email_password
    ```
4.  Start the server:
    ```bash
    npm start
    ```

### Frontend

1.  Navigate to the `frontend` directory.
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```

## API Endpoints

A detailed list of API endpoints can be found in the route files in the `backend/routes` directory.

## Deployment

For deployment, you will need to set up a production-ready environment with a process manager like PM2 and a web server like Nginx to act as a reverse proxy.

## Contributing

Contributions are welcome! Please feel free to submit a pull request.
