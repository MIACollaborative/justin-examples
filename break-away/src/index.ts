import JustIn, { JUser, JEvent, Log, StepReturnResult, DecisionRuleRegistration } from 'justin-core';
import { config } from "dotenv";
import { EmailUtility }  from './lib/email-utility';
import { MessageBank } from './lib/message-bank';
config();  

async function sendEmailMessage(user: JUser, event: JEvent, message: string): Promise<Record<string, any>> {
  console.log(`Sending email to user: ${user.id} at ${event.timestamp}: ${message}`);

  // Testing: Replace this with actual email sending logic
  //await new Promise((resolve) => setTimeout(resolve, 100));

  // Real code
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

    // check that it is on the clock or 30 minutes after the clock
    const minutes = nowDate?.getMinutes();

    // To Do: remove debug setting
    //status = 'success'; // Debug setting to always activate
    
    if (typeof minutes === 'number' && minutes % 30 === 0) {
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
    let action: 'SendEmail' | 'NoAction' = 'NoAction';

    // get a random number and send email 50% of the time
    const randomNumber = Math.random();
    if (randomNumber < 0.5) {
      action = 'SendEmail';
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
      console.log(`Action taken for user: ${user.id}`, returnObject);
      return returnObject;
    } else {
      const returnObject: StepReturnResult<any> = {
        status: "success",
        result: {
          message: 'No action taken',
        },
      };
      console.log(`No action taken for user: ${user.id}`);  
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
  
  await justin.addUsersToDatabase([
    {
      id: 'user1',
      uniqueIdentifier: 'person1',
      attributes: { email: process.env.TEST_RECIPIENT_EMAIL_1, timezone: 'America/Detroit', name: 'Person One'},
    },
    {
      id: 'user2',
      uniqueIdentifier: 'person2',
      attributes: { email: process.env.TEST_RECIPIENT_EMAIL_2, timezone: 'America/Chicago', name: 'Person Two'},
    },
  ]);

  await justin.startEngine();
  console.log('Sample app started: will send email every 1 second.');
}

main().catch((err) => {
  console.error('Error in sample app:', err);
});


