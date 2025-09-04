import { DecisionRuleRegistration, JEvent, JUser, Log, StepReturnResult } from "@just-in/core";
import { MessageBank } from "../lib/message-bank";
import { EmailUtility } from "../lib/email-utility"

const name: string = 'sendEmailDecisionRule';
const minutesBetweenEmails: number = 2; // normally 60
const probabilityOfPersuasiveEmail: number = 0.5;
const checkinFormLink = process.env.CHECKIN_FORM_LINK as string;

const enum Action {
  SendPersuasiveEmail = 'SendPersuasiveEmail',
  SendGenericEmail = 'SendGenericEmail',
}

const enum ContentType {
  Persuasive = 'persuasive',
  Generic = 'generic',
}

// Determines whether the decision rule should activate for a given user and event
const shouldActivate = async (
  user: JUser,
  event: JEvent
): Promise<StepReturnResult> => {
  
  // Default to "do not activate"
  let status: 'stop' | 'success' | 'error' = 'stop';

  const nowDate = event.generatedTimestamp;
  const roundedMinutes = Math.round(nowDate?.getTime() / (1000 * 60));

  // Is the current minute a multiple of the minutes between emails?
  if (roundedMinutes % minutesBetweenEmails === 0) {

    // If it is, activate the rule
    status = 'success';
  }
  else {
    // For demo purposes, print the "do not activate" result
    console.log(`
      ${event.generatedTimestamp?.toISOString()} - ${name} 
      did not activate for user: ${user.uniqueIdentifier} (${user.attributes.preferred_name})
    `);
  }

  // If status is "stop", this rule will not activate and other steps will not run
  return { status: status, result: {} };
};

// Selects an action to take for a given user and event
const selectAction = async (
  user: JUser,
  _event: JEvent,
  _previousResult: StepReturnResult
): Promise<StepReturnResult> => {

  let action: Action;

  // Roll the dice to determine if we should send a persuasive email
  const diceRoll = Math.random();
  if (diceRoll < probabilityOfPersuasiveEmail) {
    action = Action.SendPersuasiveEmail;
  } else {
    action = Action.SendGenericEmail;
  }

  return {
    status: 'success',
    result: {
      action: action,
    },
  };
};

const doAction = async (
  user: JUser,
  event: JEvent,
  previousResult: StepReturnResult
): Promise<StepReturnResult<any>> => {

  // Get the action from the previous result
  const { action } = previousResult.result as Record<string, any>;

  // Set the email service provider
  const emailServiceProvider: "sendgrid" | "mailjet" = "sendgrid";

  let contentType: ContentType;

  // Check the selected action and determine the type of message
  if (action === Action.SendPersuasiveEmail) {
    contentType = ContentType.Persuasive;
  } else {
    contentType = ContentType.Generic;
  }

  // Get a random message from the message bank based on the content type
  const messageContent = MessageBank.getMessageRandomlyByTag(contentType);

  // Send the email
  const sendStatus = await EmailUtility.sendEmail(
    emailServiceProvider,
    "BreakAway Notification",
    process.env.VERIFIED_SENDER_EMAIL as string,
    [{ name: user.attributes.preferred_name, address: user.attributes.email }],
    "BreakAway Notification",
    messageContent,
    `
      <p>Hi ${user.attributes.preferred_name}</p>
      <p>${messageContent}</p>
      <p>Check-in here: 
        <a href="${checkinFormLink.replace('[email]', user.attributes.email)}">
          Google Form
        </a>
      </p>
    `
  );

  // For demo purposes, print the action and result 
  console.log(`
    ${event.generatedTimestamp?.toISOString()} - ${name} 
    sent ${action} email to user: ${user.uniqueIdentifier} (${user.attributes.preferred_name})  
    with content type: ${contentType}
    and message: ${messageContent}
  `);

  // Return a detailed result to be logged for later analysis
  return {
    status: "success",
    result: {
      message: 'Action taken',
      action: action,
      sendStatus: sendStatus,
      contentType: contentType,
      messageContent: messageContent,
    },
  };
}

export const ScreenBreakEmailDecisionRule: DecisionRuleRegistration = {
  name: name,
  shouldActivate: shouldActivate,
  selectAction: selectAction,
  doAction: doAction,
};