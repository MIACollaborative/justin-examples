import { EmailUtility } from "../email-utility";
import { config } from "dotenv";
config({ quiet: true });
EmailUtility.sendEmail("BreakAway Notification", process.env.VERIFIED_SENDER_EMAIL as string, [{ name: "Test Recipient", address: process.env.TEST_RECIPIENT_EMAIL_1 as string }], "Break Away", "Break Away Test").then((result) => {
  console.log("Email sent successfully:", result);
}).catch((error) => {
  console.error("Error sending email:", error);
});