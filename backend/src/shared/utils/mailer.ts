import nodemailer from "nodemailer";
import { env } from "../../config/env";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) {
    throw new Error(
      "Email is not configured - set GMAIL_USER and GMAIL_APP_PASSWORD in the backend .env to send password reset codes."
    );
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: env.GMAIL_USER, pass: env.GMAIL_APP_PASSWORD },
    });
  }

  return transporter;
}

export async function sendPasswordResetEmail(to: string, code: string): Promise<void> {
  await getTransporter().sendMail({
    from: `"Chapter Book Store" <${env.GMAIL_USER}>`,
    to,
    subject: "Your password reset code",
    text: `Your password reset code is ${code}. It expires in 15 minutes. If you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #111;">Reset your password</h2>
        <p style="color: #444;">Use this code to reset your Chapter Book Store password. It expires in 15 minutes.</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111; margin: 24px 0;">${code}</p>
        <p style="color: #888; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendBookRequestFulfilledEmail(
  to: string,
  bookTitle: string,
  bookUrl?: string
): Promise<void> {
  await getTransporter().sendMail({
    from: `"Chapter Book Store" <${env.GMAIL_USER}>`,
    to,
    subject: "Good news - your requested book is here!",
    text: `The book you requested, "${bookTitle}", has been added to our catalog.${
      bookUrl ? ` View it here: ${bookUrl}` : ""
    }`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #111;">Your requested book is here!</h2>
        <p style="color: #444;">Good news - the book you requested, <strong>"${bookTitle}"</strong>, has just been added to our catalog.</p>
        ${
          bookUrl
            ? `<p style="margin: 24px 0;"><a href="${bookUrl}" style="background: #111; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">View the book</a></p>`
            : ""
        }
        <p style="color: #888; font-size: 13px;">Thanks for letting us know what you'd like to read.</p>
      </div>
    `,
  });
}
