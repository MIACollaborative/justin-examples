import { EmailUtility } from "../lib/email-utility";
// print MAILJET_API_KEY and MAILJET_SECRET_KEY from .env file
 
import { inspect } from "util";
EmailUtility.sendEmail("JustIn Notification", "justin-alearts@umich.edu", [{name: "Pei-Yao Hung", address: "peiyaoh@umich.edu"}], "Test Subject", "Test Body").then((result) => {
  console.log("Email sent successfully:", result);
}).catch((error) => {
  console.error("Error sending email:", error);
});