import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// IMPORTANT: Remember to install nodemailer: npm install nodemailer

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM, // Sender address
            to, // List of receivers
            subject, // Subject line
            html, // html body
        });
        console.log(`Email sent to ${to} with subject: ${subject}`);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
        throw new Error('Failed to send email.');
    }
};

export { sendEmail };