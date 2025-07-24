import { MessageBank } from "../message-bank";

MessageBank.loadMessages()
    .then(() => {
        console.log("Messages loaded successfully.");
    })
    .catch((error) => {
        console.error("Failed to load messages:", error);
    });
