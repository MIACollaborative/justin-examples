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

const enum ContentTag {
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
    console.log(`${event.generatedTimestamp?.toISOString()} - ${name} did not activate for user: ${user.uniqueIdentifier} (${user.attributes.preferred_name})`);
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

  // Default to sending a generic email
  let action: Action = Action.SendGenericEmail;

  // Roll the dice to determine if we should send a persuasive email
  const diceRoll = Math.random();
  if (diceRoll < probabilityOfPersuasiveEmail) {
    action = Action.SendPersuasiveEmail;
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

  const { action } = previousResult.result as Record<string, any>;
  let returnObject: StepReturnResult<any>;
  let interventionMessage: string;
  const emailServiceProvider: "sendgrid" | "mailjet" = "sendgrid";

  // If the result of selectAction was to send a persuasive email, send it
  if (action === Action.SendPersuasiveEmail) {

    // Get a random message from the message bank with the persuasive tag
    const tag = ContentTag.Persuasive;
    interventionMessage = MessageBank.getMessageRandomlyByTag(tag);

    // Send the email
    const sendStatus = await EmailUtility.sendEmail(
      emailServiceProvider,
      "BreakAway Notification",
      process.env.VERIFIED_SENDER_EMAIL as string,
      [{ name: user.attributes.preferred_name, address: user.attributes.email }],
      "BreakAway Notification",
      interventionMessage,
      `
        <p>Hi ${user.attributes.preferred_name}</p>
        <p>${interventionMessage}</p>
        <p>Check-in here: 
          <a href="${checkinFormLink.replace('[email]', user.attributes.email)}">
            Google Form
          </a>
        </p>
      `
    );

    // Return a detailed result to be logged for later analysis
    returnObject = {
      status: "success",
      result: {
        message: 'Action taken',
        action: action,
        sendStatus: sendStatus,
        contentTag: tag,
        contentMessage: interventionMessage,
      },
    };
  } 

  // If the result of selectAction was to send a generic email, send it
  else {
    // Get a random message from the message bank with the generic tag
    const tag = ContentTag.Generic;
    interventionMessage = MessageBank.getMessageRandomlyByTag(tag);

    // Send the email
    const sendStatus = await EmailUtility.sendEmail(
      emailServiceProvider,
      "BreakAway Notification",
      process.env.VERIFIED_SENDER_EMAIL as string,
      [{ name: user.attributes.preferred_name, address: user.attributes.email }],
      "BreakAway Notification",
      interventionMessage,
      `
        <p>Hi ${user.attributes.preferred_name}</p>
        <p>${interventionMessage}</p>
        <p>Check-in here: 
          <a href="${checkinFormLink.replace('[email]', user.attributes.email)}">
            Google Form
          </a>
        </p>
      `
    );

    // Return a detailed result to be logged for later analysis
    returnObject = {
      status: "success",
      result: {
        message: 'Action taken',
        action: action,
        sendStatus: sendStatus,
        contentTag: tag,
        contentMessage: interventionMessage,
      },
    };
  }
  // For demo purposes, print the action taken and the message sent
  console.log(`
    ${event.generatedTimestamp?.toISOString()} - Action ${action} taken for user: 
    ${user.uniqueIdentifier} (${user.attributes.preferred_name}). 
    Message sent: ${interventionMessage}
  `);
  return returnObject;
}

export const ScreenBreakEmailDecisionRule: DecisionRuleRegistration = {
  name: name,
  shouldActivate: shouldActivate,
  selectAction: selectAction,
  doAction: doAction,
};