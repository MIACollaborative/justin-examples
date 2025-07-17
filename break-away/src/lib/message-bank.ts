const messageList = [
  {
    content: "Take a break!",
    tagList: ["generic"],
  },
  {
    content: "A brief screen break can refresh your mind and boost your focus.",
    tagList: ["tailored"],
  },
  {
    content: "Even a five-minute stretch away from your screen can significantly improve your well-being.",
    tagList: ["tailored"],
  },
  {
    content: "Many colleagues find a short screen break helps maintain energy and creativity throughout the day.",
    tagList: ["tailored"],
  },
  {
    content: "Invest in your well-being: a mindful screen break can prevent fatigue and enhance productivity.",
    tagList: ["tailored"],
  },
  {
    content: "Start fresh with a quick break; consistent pauses lead to sustained clarity and comfort.",
    tagList: ["tailored"],
  }
];

const getMessageRanddomlyByTag = (tag: string): string => {
  const filteredMessages = messageList.filter(message => message.tagList.includes(tag));
  if (filteredMessages.length === 0) {
    return "No messages available for this tag.";
  }
  const randomIndex = Math.floor(Math.random() * filteredMessages.length);
  return filteredMessages[randomIndex].content;
};

// export as a module named MessageBank
export const MessageBank = {
  getMessageRanddomlyByTag
};
