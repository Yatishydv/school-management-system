import nodemailer from "nodemailer";

export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SCHOOL_EMAIL,
        pass: process.env.SCHOOL_EMAIL_PASSWORD,
      },
    });

    // Email content
    await transporter.sendMail({
      from: process.env.SCHOOL_EMAIL,
      to: process.env.SCHOOL_EMAIL,        // School inbox
      subject: `New Contact Message: ${subject}`,
      html: `
        <h2>New Contact Form Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
    });

    res.json({ success: true, message: "Message sent" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Email sending failed" });
  }
};
