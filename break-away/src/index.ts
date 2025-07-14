import JustIn, { JUser, JEvent, Log } from 'justin-core';
const justin = JustIn();
/*
import {
  DecisionRuleRegistration,
  StepReturnResult,
} from 'justin-core/src/handlers/handler.type';


// import mailjet function
async function sendEmail(user: JUser, event: JEvent): Promise<StepReturnResult> {
  Log.info(`Sending email to user: ${user.id}`);

  // Replace this with actual email sending logic
  await new Promise((resolve) => setTimeout(resolve, 100));

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
    if (typeof minutes === 'number' && minutes % 30 === 0) {
      status = 'success';
    }
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

    return {
      status: 'success',
      result: {
        action: action,
      },
    };
  },
  doAction: async (user, event, previousResult) => {
    const { action } = previousResult.result as Record<string, any>;
    if (action === 'SendEmail') {
      const sendStatus = await sendEmail(user, event);
      return {
        status: 'success',
        result: {
          message: 'Action taken',
          sendStatus: sendStatus,
        },
      };
    } else {
      return {
        status: 'success',
        result: {
          message: 'No action taken',
        },
      };
    }
  },
};

async function main() {
  const justin = JustIn();
  await justin.initializeDB();

  justin.registerDecisionRule(emailDecisionRule);

  await justin.registerClockEventHandlers(
    'sendEmailEvery30Min',
    30 * 60 * 1000,
    ['sendEmailDecisionRule']
  );

  // To Do: Need to load content
  
  await justin.addUsersToDatabase([
    {
      id: 'user1',
      email: 'user1@example.com',
      attributes: { timezone: 'America/Detroit' },
    },
    {
      id: 'user2',
      email: 'user2@example.com',
      attributes: { timezone: 'America/Chicago' },
    },
  ]);

  await justin.startEngine();
  Log.info('Sample app started: will send email every 30 minutes.');
}

main().catch((err) => {
  Log.error('Error in sample app:', err);
});
*/