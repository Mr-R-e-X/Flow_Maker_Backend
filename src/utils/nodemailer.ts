import nodemailer from "nodemailer";
import { verificationMailBody } from "../constants/defaultMailTemplates.js";

const sendVerificationEmail = async (
  to: string,
  subject: string,
  otp: string,
  name: string
) => {
  const transporter = nodemailer.createTransport({
    service: process.env.SMPT_PROVIDER,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_EMAIL_PASSWORD,
    },
  });
  const mailOpts = {
    from: process.env.SMTP_EMAIL,
    to,
    subject,
    html: verificationMailBody(otp, name),
  };
  const info = await transporter.sendMail(mailOpts);
  return info;
};

const sendMail = async (to: string, subject: string, body: string) => {
  const transporter = nodemailer.createTransport({
    service: process.env.SMPT_PROVIDER,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_EMAIL_PASSWORD,
    },
  });
  const mailOpts = {
    from: process.env.SMTP_EMAIL,
    to,
    subject,
    html: body,
  };
  const info = await transporter.sendMail(mailOpts);
  return info;
};

export { sendVerificationEmail, sendMail };
