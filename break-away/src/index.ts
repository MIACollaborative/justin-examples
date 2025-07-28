import JustIn, { Log, JUser, JEvent, StepReturnResult, DecisionRuleRegistration } from '@just-in/core';
import { config } from "dotenv";
import { MessageBank } from './lib/message-bank';
import { UserHelper } from './lib/user-helper';
import { ScreenBreakEmailDecisionRule } from './decision-rules/screen-break-email.dr';

config();

async function main() {

  const justIn = JustIn();
  
  justIn.setLoggingLevels({
    dev: false,
    info: false,
    warn: false,
    error: true,
    handlerResults: false,
  });

  await justIn.init();
  
  const usersToAdd = await UserHelper.loadUsers();
  await justIn.addUsersToDatabase(usersToAdd);
  await MessageBank.loadMessages();

  const intervalInMilliseconds = 60 * 1000; // 1 minute
  const intervalTimerEventType = 'intervalTimerEvent';
  justIn.createIntervalTimerEventGenerator(
    intervalTimerEventType,
    intervalInMilliseconds,
  );

  justIn.registerDecisionRule(ScreenBreakEmailDecisionRule);
  justIn.registerEventHandlers(intervalTimerEventType, [ScreenBreakEmailDecisionRule.name]);

  await justIn.startEngine();
}

main().catch((err) => {
  console.error('Error in sample app:', err);
});


