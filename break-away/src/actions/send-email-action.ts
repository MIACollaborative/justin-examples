import { JEvent, JUser, Log } from "@just-in/core";
import { EmailUtility } from "../lib/email-utility";

export const sendEmailMessage = async(
  user: JUser, 
  event: JEvent,
  message: string
): Promise<Record<string, any>> => {

  const checkinFormLink = process.env.CHECKIN_FORM_LINK as string;
  const result = await EmailUtility.sendEmail(
    "BreakAway Notification", // Sender name
    process.env.VERIFIED_SENDER_EMAIL as string, // Sender address
    [
      {
        name: user.attributes.name,
        address: user.attributes.email
      }
    ], // Recipient name and address
    `Break Away`, // Subject
    ``, // Text content
    `<p>Hi ${user.attributes.name}</p><p>${message}</p><p>Check-in here: <a href="${checkinFormLink.replace('[email]', user.attributes.email)}">Google Form</a></p>`, // HTML content
    'JustInEventNotification' // Custom ID
  );

  return { status: 'success', result: result };
}