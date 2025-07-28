import Mailjet from "node-mailjet";
import { config } from "dotenv";
import { inspect } from "util";
import { Log } from "@just-in/core";
import sgMail from "@sendgrid/mail";
import { EmailPayload } from "./email.types";

config();  

const sendWithSendGrid = async (payload: EmailPayload): Promise<any> => {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY is not set");
  }
  if (!process.env.VERIFIED_SENDER_EMAIL) {
    throw new Error("VERIFIED_SENDER_EMAIL is not set");
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg: any = {
    from: { email: process.env.VERIFIED_SENDER_EMAIL, name: payload.from.name },
    to: payload.to.map(r => r.address),
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  };

  try {
    const [response] = await sgMail.send(msg);
    Log.info("SendGrid response:", {
      statusCode:   response.statusCode,
      headers:      response.headers,
    });
    return {
      provider: "sendgrid",
      status:   response.statusCode,
      headers:  response.headers,
    };
  } catch (err: any) {
    Log.error("SendGrid error:", err);
    return {
      provider: "sendgrid",
      error: inspect(err),
    };
  }
}

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
  console.log(`API keys: ${process.env.MAILJET_API_KEY} and ${process.env.MAILJET_SECRET_KEY}`);
  const mailjet = Mailjet.apiConnect(
    process.env.MAILJET_API_KEY as string,
    process.env.MAILJET_SECRET_KEY as string
  );

  let unifiedResponse = {
    type: "default type",
    status: -1,
    statusText: "default status",
    message: "default message",
    headers: {},
    config: {},
    request: {},
    body: {},
  };

  try {
    const result = await mailjet
      .post("send", { version: "v3.1" })
      .request({
        "Messages": emailInfoList,
      });
    console.log(`Email sent result: ${JSON.stringify(result, null, 2)}`);
//    Log.info("Email sent result:", result.body);
    unifiedResponse.type = "response";
    unifiedResponse.status = result.response.status;
    unifiedResponse.statusText = result.response.statusText;
    unifiedResponse.headers = result.response.headers;
    unifiedResponse.config = result.response.config;
    unifiedResponse.body = result.body;
    console.log(`Email sent result: ${JSON.stringify(unifiedResponse, null, 2)}`);
  } catch (error) {
    unifiedResponse.type = "error";
    unifiedResponse.message = inspect(error);
    console.log(`Email sent error: ${unifiedResponse.message}`);
    throw error;
  }
  return unifiedResponse;
};

const sendEmail = async ( 
  senderName: string, 
  senderAddress: string,
  recipientNameAddressList: { name: string, address: string }[],
  subject: string,
  textContent: string,
  htmlContent?: string,
  customID: string = "JustIn Email Notification"
): Promise<Object> => {
  const emailInfoList = recipientNameAddressList.map(
    ({ name: recipientName, address: recipientAddress }) => ({
      From: { Email: senderAddress, Name: senderName },
      To: [{ Email: recipientAddress, Name: recipientName }],
      Subject: subject,
      TextPart: textContent,
      HTMLPart: htmlContent? `${htmlContent}` : `<p>${textContent}</p>`,
      CustomID: customID
    }
  ));
  return sendEmailThroughMailjet(emailInfoList);
};

export const EmailUtility =  {
    sendEmail
};