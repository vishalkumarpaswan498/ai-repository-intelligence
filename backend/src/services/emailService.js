import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

console.log(
  "EMAIL_USER loaded:",
  !!process.env.EMAIL_USER
);

console.log(
  "EMAIL_PASSWORD loaded:",
  !!process.env.EMAIL_PASSWORD
);

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Send OTP email
export const sendOTPEmail = async (
  email,
  otp,
  purpose = "verification"
) => {
  const subject =
    purpose === "password-reset"
      ? "Reset Your Password - Miravex Technologies"
      : "Verify Your Email - Miravex Technologies";

  const message =
    purpose === "password-reset"
      ? `
        <h2>Password Reset Request</h2>
        <p>Your password reset OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `
      : `
        <h2>Welcome to AI-Powered Multi-Agent Repository Intelligence</h2>
        <p>Your email verification OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 10 minutes.</p>
      `;

  try {
    await transporter.sendMail({
      from: `"Miravex Technologies" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: message,
    });

    console.log(`OTP email sent to: ${email}`);
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Failed to send OTP email");
  }
};