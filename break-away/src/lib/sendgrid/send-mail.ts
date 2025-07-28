import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const sendGridSendEmail = async (
  to: string | string[], 
  subject: string, 
  text: string,
  html?: string
): Promise<any> => {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY is not set");
  }

  if (!process.env.VERIFIED_SENDER_EMAIL) {
    throw new Error("VERIFIED_SENDER_EMAIL is not set");
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to,
    from: process.env.VERIFIED_SENDER_EMAIL,
    subject,
    text,
    html,
  };

  const result = await sgMail.send(msg);
  return result;
};

