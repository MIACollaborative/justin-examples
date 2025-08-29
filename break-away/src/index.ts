import JustIn from '@just-in/core';
import { config } from "dotenv";
import { MessageBank } from './lib/message-bank';
import { UserHelper } from './lib/user-helper';
import { ScreenBreakEmailDecisionRule } from './decision-rules/screen-break-email.dr';

config({ quiet: true });

async function main() {

  const justIn = JustIn();
  
  justIn.setLoggingLevels({
    dev: false,
    info: false,
    warn: true,
    error: true
  });

  // Initialize JustIn
  await justIn.init();
  
  // Load users from CSV file
  const usersToAdd = await UserHelper.loadUsers();
  await justIn.addUsers(usersToAdd);

  // Load messages from CSV file
  await MessageBank.loadMessages();

  // Create a timer to generate events every minute
  const intervalInMilliseconds = 60 * 1000; // 1 minute
  const intervalTimerEventType = 'intervalTimerEvent';
  justIn.createIntervalTimerEventGenerator(
    intervalTimerEventType,
    intervalInMilliseconds,
  );

  // Register a decision rule and assign it to the timer event
  justIn.registerDecisionRule(ScreenBreakEmailDecisionRule);
  justIn.registerEventHandlers(intervalTimerEventType, [ScreenBreakEmailDecisionRule.name]);

  // Start the engine
  await justIn.startEngine();
}

main().catch((err) => {
  console.error('Error in sample app:', err);
});


