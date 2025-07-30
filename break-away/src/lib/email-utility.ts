import Mailjet from "node-mailjet";
import { config } from "dotenv";
import { inspect } from "util";
import { Log } from "@just-in/core";
import sgMail from "@sendgrid/mail";
import { EmailPayload } from "./email.types";

config({ quiet: true });

const sendWithSendGrid = async (payload: EmailPayload): Promise<any> => {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY is not set");
  }
  if (!process.env.VERIFIED_SENDER_EMAIL) {
    throw new Error("VERIFIED_SENDER_EMAIL is not set");
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg: any = {
    from: { email: payload.from.email, name: payload.from.name },
    to: payload.to.map((r) => r.address),
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  };

  try {
    const [response] = await sgMail.send(msg);
    return {
      provider: "sendgrid",
      status: response.statusCode,
      headers: response.headers,
    };
  } catch (err: any) {
    Log.error("SendGrid error:", err);
    return {
      provider: "sendgrid",
      error: inspect(err),
    };
  }
};

const sendEmailThroughMailjet = async (
  emailInfoList: {
    From: { Email: string; Name: string };
    To: { Email: string; Name: string }[];
    Headers?: Object;
    Cc?: { Email: string; Name: string }[];
    Bcc?: { Email: string; Name: string }[];
    Subject: string;
    TextPart: string;
    HTMLPart?: string;
    CustomID?: string;
  }[]
): Promise<Object> => {
  const mailjet = Mailjet.apiConnect(
    process.env.MAILJET_API_KEY as string,
    process.env.MAILJET_SECRET_KEY as string
  );

  try {
    const result = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: emailInfoList,
    });
    return {
      provider: "mailjet",
      status: result.response.status,
      headers: result.response.headers,
    };
    
  } catch (error) {
    Log.error("Mailjet error:", error);
    return {
      provider: "mailjet",
      error: inspect(error),
    };
  }
};

const sendEmail = async (
  serviceName: "mailjet" | "sendgrid" = "sendgrid",
  senderName: string,
  senderAddress: string,
  recipientNameAddressList: { name: string; address: string }[],
  subject: string,
  textContent: string,
  htmlContent?: string,
  customID: string = "JustIn Email Notification"
): Promise<object> => {
  if (serviceName === "sendgrid") {
    return sendWithSendGrid({
      from: { name: senderName, email: senderAddress },
      to: recipientNameAddressList,
      subject,
      text: textContent,
      html: htmlContent,
    });
  }
  const emailInfoList = recipientNameAddressList.map(
    ({ name: recipientName, address: recipientAddress }) => ({
      From: { Email: senderAddress, Name: senderName },
      To: [{ Email: recipientAddress, Name: recipientName }],
      Subject: subject,
      TextPart: textContent,
      HTMLPart: htmlContent ? `${htmlContent}` : `<p>${textContent}</p>`,
      CustomID: customID,
    })
  );
  return sendEmailThroughMailjet(emailInfoList);
};

export const EmailUtility = {
  sendEmail,
};
