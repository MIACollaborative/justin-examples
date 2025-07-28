import { DecisionRuleRegistration, JEvent, JUser, Log, StepReturnResult } from "justin-core";
import { MessageBank } from "../lib/message-bank";
import { sendEmailMessage } from "../actions/send-email-action";
import { sendGridSendEmail } from "../lib/sendgrid/send-mail";

const name: string =  'sendEmailDecisionRule';
const minutesBetweenEmails: number = 2;
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

const shouldActivate = async (
  user: JUser,
  event: JEvent
): Promise<StepReturnResult> => {
  //TODO: make this an enum in JustIn Core
  let status: 'stop' | 'success' | 'error' = 'stop';

  const nowDate = event.generatedTimestamp;
  const roundedMinutes = Math.round(nowDate?.getTime() / (1000 * 60));

  if (roundedMinutes % minutesBetweenEmails === 0) {
    status = 'success';
  } else {
    console.log(`${event.generatedTimestamp?.toISOString()} - ${name} did not activate for user: ${user.uniqueIdentifier} (${user.attributes.name})`);
  }

  return { status: status, result: {} };
};

const selectAction = async (
  user: JUser,
  _event: JEvent,
  _previousResult: StepReturnResult
): Promise<StepReturnResult> => {

  let action: Action = Action.SendGenericEmail;

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
  if (action === Action.SendPersuasiveEmail) {
    const tag = ContentTag.Persuasive;
    interventionMessage = MessageBank.getMessageRandomlyByTag(tag);
    const sendStatus = await sendGridSendEmail(
      user.attributes.email, 
      "BreakAway Notification", 
      interventionMessage,
      `<p>Hi ${user.attributes.name}</p><p>${interventionMessage}</p><p>Check-in here: <a href="${checkinFormLink.replace('[email]', user.attributes.email)}">Google Form</a></p>`);

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
  } else {
    const tag = ContentTag.Generic;
    interventionMessage = MessageBank.getMessageRandomlyByTag(tag);
    const sendStatus = await sendGridSendEmail(
      user.attributes.email, 
      "BreakAway Notification", 
      interventionMessage,
      `<p>Hi ${user.attributes.name}</p><p>${interventionMessage}</p><p>Check-in here: <a href="${checkinFormLink.replace('[email]', user.attributes.email)}">Google Form</a></p>`);

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
  console.log(`${event.generatedTimestamp?.toISOString()} - Action ${action} taken for user: ${user.uniqueIdentifier} (${user.attributes.name}). Message sent: ${interventionMessage}`);
  return returnObject;
}

export const ScreenBreakEmailDecisionRule: DecisionRuleRegistration = {
  name: name,
  shouldActivate: shouldActivate,
  selectAction: selectAction,
  doAction: doAction,
};