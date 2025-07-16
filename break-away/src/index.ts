import JustIn, { JUser, JEvent, Log, StepReturnResult, DecisionRuleRegistration } from 'justin-core';
import { EmailUtility }  from './lib/email-utility';
import { MessageBank } from './lib/message-bank';

async function sendEmailMessage(user: JUser, event: JEvent, message: string): Promise<Record<string, any>> {
  Log.dev(`Sending email to user: ${user.id} at ${event.timestamp}: ${message}`);

  // Testing: Replace this with actual email sending logic
  await new Promise((resolve) => setTimeout(resolve, 100));

  // real code
  const result = await EmailUtility.sendEmail(
    "JustIn Notification", // Sender name
    "server@example.com", // Sender address
    [
      {
        name: user.attributes.name, 
        address: user.attributes.email
      }
    ], // Recipient name and address
    `Break Away`, // Subject
    ``, // Text content
    `<p>Hi ${user.attributes.name}</p><p>${message}</p><p>Check-in: </p>`, // HTML content
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

    // check that it is on the clock or 30 minutes after the clock
    const minutes = nowDate?.getMinutes();

    // To Do: remove debug setting
    status = 'success'; // Debug setting to always activate
    /*
    if (typeof minutes === 'number' && minutes % 30 === 0) {
      status = 'success';
    }
    */
    Log.dev(`${status === 'success' ? '' : 'Not '}activate action for user: ${user.id}`);
    return { status: status, result: {} };
  },
  selectAction: async (
    user: JUser,
    _event: JEvent,
    _previousResult: StepReturnResult
  ): Promise<StepReturnResult> => {
    let action: 'SendEmail' | 'NoAction' = 'NoAction';

    // get a random number and send email 50% of the time
    const randomNumber = Math.random();
    if (randomNumber < 0.5) {
      action = 'SendEmail';
    }

    Log.dev(`Selected action: ${action} for user: ${user.id}`);
    return {
      status: 'success',
      result: {
        action: action,
      },
    };
  },
  doAction: async (user: JUser, event: JEvent, previousResult: StepReturnResult): Promise<StepReturnResult<any>> => {
    const { action } = previousResult.result as Record<string, any>;
    if (action === 'SendEmail') {
      const tag = Math.random() < 0.5 ? 'generic' : 'tailored';
      
      const message = MessageBank.getMessageRanddomlyByTag(tag);

      const sendStatus = await sendEmailMessage(user, event, message);

      const returnObject: StepReturnResult<any> = {
        status: "success",
        result: {
          message: 'Action taken',
          sendStatus: sendStatus,
          contentTag: tag,
          contentMessage: message,
        },
      };
      Log.dev(`Action taken for user: ${user.id}`, returnObject);
      return returnObject;
    } else {
      const returnObject: StepReturnResult<any> = {
        status: "success",
        result: {
          message: 'No action taken',
        },
      };
      Log.dev(`No action taken for user: ${user.id}`);  
      return returnObject;
    }
  },
};

async function main() {
  const justin = JustIn();
  await justin.initializeDB();

  const intervalInMilliseconds = 5 * 1000; // 1 second

  justin.registerDecisionRule(emailDecisionRule);

  await justin.registerClockEvent(
    'sendEmailEvery1Sec',
    intervalInMilliseconds,
    ['sendEmailDecisionRule']
  );

  // To Do: Need to load content
  
  await justin.addUsersToDatabase([
    {
      id: 'user1',
      uniqueIdentifier: 'person1',
      attributes: { email: 'user1@example.com', timezone: 'America/Detroit', name: 'Person One'},
    },
    {
      id: 'user2',
      uniqueIdentifier: 'person2',
      attributes: { email: 'user2@example.com', timezone: 'America/Chicago', name: 'Person Two'},
    },
  ]);

  await justin.startEngine();
  Log.info('Sample app started: will send email every 1 second.');
}

main().catch((err) => {
  Log.error('Error in sample app:', err);
});


