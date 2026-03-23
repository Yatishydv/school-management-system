# Installation Guide

This guide provides instructions for setting up the School Management System for local development.

## Prerequisites

*   **Node.js:** Make sure you have Node.js installed. You can download it from [nodejs.org](https://nodejs.org/).
*   **MongoDB:** You need a running instance of MongoDB. You can install it locally or use a cloud service like MongoDB Atlas.
*   **Git:** You need Git to clone the repository.

## Backend Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd school-management-system/backend
    ```

2.  **Install dependencies:**
    Open a terminal in the `backend` directory and run the following command to install the necessary packages:
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a new file named `.env` in the `backend` directory. This file will store your environment-specific configurations. Copy the following content into the `.env` file and replace the placeholder values with your actual data:
    ```env
    # Server Configuration
    PORT=5000

    # MongoDB Connection
    MONGODB_URI=mongodb://localhost:27017/school-management-system

    # JWT Authentication
    JWT_SECRET=your_super_secret_jwt_key_that_is_long_and_random

    # Frontend URL (for CORS)
    FRONTEND_URL=http://localhost:5173

    # Email Configuration (for password resets, etc. - using a service like SendGrid is recommended)
    EMAIL_USER=your_email@example.com
    EMAIL_PASS=your_email_password
    ```
    **Important:**
    *   Replace `your_super_secret_jwt_key...` with a long, random, and secure string.
    *   If your MongoDB is running on a different host or port, update the `MONGODB_URI` accordingly.

4.  **Run the database seed (optional):**
    If there is a seed script available to populate the database with initial data (e.g., an admin user), run it.
    ```bash
    npm run seed
    ```
    *(Note: This command might vary depending on the project setup.)*

5.  **Start the backend server:**
    You can start the server in development mode, which will automatically restart on file changes.
    ```bash
    npm run dev
    ```
    Or, you can run it in production mode:
    ```bash
    npm start
    ```
    The backend API should now be running on `http://localhost:5000`.

## Frontend Setup

1.  **Navigate to the frontend directory:**
    Open a new terminal and navigate to the `frontend` directory:
    ```bash
    cd ../frontend
    ```

2.  **Install dependencies:**
    Install the frontend packages by running:
    ```bash
    npm install
    ```

3.  **Start the frontend development server:**
    Run the following command to start the React development server:
    ```bash
    npm run dev
    ```
    The frontend application should now be accessible at `http://localhost:5173`. The application will automatically connect to the backend API running on port 5000.

## First-Time Admin Registration

For security, the admin registration route is typically only open when there are no other admins in the database.

1.  Ensure your backend server is running.
2.  Use a tool like Postman or `curl` to send a `POST` request to `http://localhost:5000/api/auth/register-admin`.
3.  Include the following JSON body in your request:
    ```json
    {
        "name": "Your Admin Name",
        "email": "admin@example.com",
        "password": "yoursecurepassword"
    }
    ```
4.  You will receive a response containing the new admin's details and a JWT token. You can now use the `uniqueId` from the response and your password to log in through the frontend application.

After the first admin is created, this registration route will be disabled. New users (teachers and students) must be added by a logged-in admin through the admin dashboard.
