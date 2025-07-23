import JustIn, { Log, JUser, JEvent, StepReturnResult, DecisionRuleRegistration } from 'justin-core';
import { config } from "dotenv";
import { EmailUtility } from './lib/email-utility';
import { MessageBank } from './lib/message-bank';
import { UserHelper } from './lib/user-helper';
config();


const minutesToSend = 2;

async function sendEmailMessage(user: JUser, event: JEvent, message: string): Promise<Record<string, any>> {
  console.log(`Sending email to user: ${user.id} at ${event.timestamp}: ${message}`);

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

  return { status: 'success', result: 'Email sent' };
}

const emailDecisionRule: DecisionRuleRegistration = {
  name: 'sendEmailDecisionRule',
  shouldActivate: async (
    user: JUser,
    event: JEvent
  ): Promise<StepReturnResult> => {
    let status: 'stop' | 'success' | 'error' = 'stop';

    const nowDate = event.timestamp;

    const minutes = nowDate?.getMinutes();

    // To Do: remove debug setting
    //status = 'success'; // Debug setting to always activate

    if (typeof minutes === 'number' && minutes % minutesToSend === 0) {
      status = 'success';
    }

    console.log(`${status === 'success' ? '' : 'Not '}activate action for user: ${user.id}`);
    return { status: status, result: {} };
  },
  selectAction: async (
    user: JUser,
    _event: JEvent,
    _previousResult: StepReturnResult
  ): Promise<StepReturnResult> => {
    let action: 'SendTailoredEmail' | 'SendGenericEmail' = 'SendGenericEmail';

    // get a random number and send email 50% of the time
    const randomNumber = Math.random();
    if (randomNumber < 0.5) {
      action = 'SendTailoredEmail';
    }

    console.log(`Selected action: ${action} for user: ${user.id}`);
    return {
      status: 'success',
      result: {
        action: action,
      },
    };
  },
  doAction: async (user: JUser, event: JEvent, previousResult: StepReturnResult): Promise<StepReturnResult<any>> => {
    const { action } = previousResult.result as Record<string, any>;
    if (action === 'SendTailoredEmail') {
      const tag = 'tailored';

      const message = MessageBank.getMessageRandomlyByTag(tag);

      const sendStatus = await sendEmailMessage(user, event, message);

      const returnObject: StepReturnResult<any> = {
        status: "success",
        result: {
          message: 'Action taken',
          action: action,
          sendStatus: sendStatus,
          contentTag: tag,
          contentMessage: message,
        },
      };
      console.log(`Action taken for user: ${user.id}`, returnObject);
      return returnObject;
    } else {
      const tag = 'generic';

      const message = MessageBank.getMessageRandomlyByTag(tag);

      const sendStatus = await sendEmailMessage(user, event, message);

      const returnObject: StepReturnResult<any> = {
        status: "success",
        result: {
          message: 'Action taken',
          action: action,
          sendStatus: sendStatus,
          contentTag: tag,
          contentMessage: message,
        },
      };
      console.log(`Action taken for user: ${user.id}`, returnObject);
      return returnObject;
    }
  },
};

async function main() {
  const justin = JustIn();

  // To Do:  this doesn't seem to work
  justin.setLoggingLevels({
    dev: false,
    info: false,
    warn: false,
    error: true,
    handlerResults: true,
  });

  await justin.initializeDB();

  const intervalInMilliseconds = 60 * 1000; // 1 minute

  justin.registerDecisionRule(emailDecisionRule);

  await justin.registerClockEvent(
    'sendEmailEveryNowAndThen',
    intervalInMilliseconds,
    ['sendEmailDecisionRule']
  );

  await justin.addUsersToDatabase(await UserHelper.loadUsers());
  await MessageBank.loadMessages();

  await justin.startEngine();
  console.log(`Sample app started: will send email every ${minutesToSend} minutes.`);
}

main().catch((err) => {
  console.error('Error in sample app:', err);
});


