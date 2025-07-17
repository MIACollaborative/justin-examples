import { EmailUtility } from "../lib/email-utility";
import { config } from "dotenv";
config();  
EmailUtility.sendEmail("BreakAway Notification", process.env.VERIFIED_SENDER_EMAIL as string, [{name: "Test Recipient", address: process.env.TEST_RECIPIENT_EMAIL as string}], "Break Away", "Break Away Test").then((result) => {
  console.log("Email sent successfully:", result);
}).catch((error) => {
  console.error("Error sending email:", error);
});