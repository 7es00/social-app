import nodemailer from "nodemailer";
import { config } from "../../config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: config.email.user, pass: config.email.pass },
});

export const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  await transporter.sendMail({
    from: `"${config.appName}" <${config.email.user}>`,
    to,
    subject,
    html,
  });
};

export const confirmationEmailTemplate = (name: string, code: string): string =>
  `<div style="font-family:Arial;max-width:600px;margin:0 auto">
    <div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:30px;text-align:center;border-radius:10px 10px 0 0">
      <h1 style="color:white;margin:0">SocialApp</h1>
    </div>
    <div style="padding:30px;background:#f9f9f9">
      <h2>Hello, ${name}!</h2>
      <p>Your confirmation code:</p>
      <div style="background:white;border:2px dashed #667eea;border-radius:8px;padding:20px;text-align:center;margin:20px 0">
        <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#667eea">${code}</span>
      </div>
      <p style="color:#999;font-size:12px">Expires in 24 hours.</p>
    </div>
  </div>`;

export const resetPasswordEmailTemplate = (name: string, code: string): string =>
  `<div style="font-family:Arial;max-width:600px;margin:0 auto">
    <div style="background:linear-gradient(135deg,#f093fb,#f5576c);padding:30px;text-align:center;border-radius:10px 10px 0 0">
      <h1 style="color:white;margin:0">SocialApp</h1>
    </div>
    <div style="padding:30px;background:#f9f9f9">
      <h2>Password Reset</h2>
      <p>Hi ${name}, your reset code:</p>
      <div style="background:white;border:2px dashed #f5576c;border-radius:8px;padding:20px;text-align:center;margin:20px 0">
        <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#f5576c">${code}</span>
      </div>
      <p style="color:#999;font-size:12px">Expires in 10 minutes.</p>
    </div>
  </div>`;
