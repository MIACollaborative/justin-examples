import { CSVUtility } from "./csv-utility";

let messageList: { content: string, tag: string }[] = [];

const loadMessages = async (): Promise<void> => {
  try {
    const result = await CSVUtility.parseCSVFile('./content/messages.csv');
    messageList = result as { content: string, tag: string }[];
  } catch (error) {  
    console.error("Error loading messages:", error);
    messageList = [];
  }
};

const getMessageRandomlyByTag = (tag: string): string => {
  const filteredMessages = messageList.filter(message => message.tag === tag);
  if (filteredMessages.length === 0) {
    return "No messages available for this tag.";
  }
  const randomIndex = Math.floor(Math.random() * filteredMessages.length);
  return filteredMessages[randomIndex].content;
};

export const MessageBank = {
  loadMessages,
  getMessageRandomlyByTag
};
