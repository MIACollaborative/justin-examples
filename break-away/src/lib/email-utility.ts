import Mailjet from "node-mailjet";
import { config } from "dotenv";
import { inspect } from "util";
config();  

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
    const result = await mailjet.post("send", { version: "v3.1" }).request({
      "Messages": emailInfoList,
    });
    console.log("Email sent result:", result.body);
    unifiedResponse.type = "response";
    unifiedResponse.status = result.response.status;
    unifiedResponse.statusText = result.response.statusText;
    unifiedResponse.headers = result.response.headers;
    unifiedResponse.config = result.response.config;
    unifiedResponse.body = result.body;
  } catch (error) {
    unifiedResponse.type = "error";
    unifiedResponse.message = inspect(error);
  }

  return unifiedResponse;
};

const sendEmail = async ( senderName: string, senderAddress: string,
  recipientNameAddressList: { name: string, address: string }[],
  subject: string,
  textContent: string,
  htmlContent?: string,
  customID: string = "JustIn Email Notification"
): Promise<Object> => {
  const emailInfoList = recipientNameAddressList.map(({ name: recipientName, address: recipientAddress }) => ({
    From: { Email: senderAddress, Name: senderName },
    To: [{ Email: recipientAddress, Name: recipientName }],
    Subject: subject,
    TextPart: textContent,
    HTMLPart: htmlContent? `${htmlContent}` : `<p>${textContent}</p>`,
    CustomID: customID
  }));
  return sendEmailThroughMailjet(emailInfoList);
};

export const EmailUtility =  {
    sendEmail
};