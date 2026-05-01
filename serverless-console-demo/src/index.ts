/**
 * Demo runner — exercises the JustInServerless engine on a fixed interval.
 *
 * Each tick simulates a real serverless invocation:
 *   1. Load users from the mock user list
 *   2. Register handlers
 *   3. Publish the trigger event
 *   4. Reset engine state for the next invocation
 *
 * Run with:
 *   yarn demo
 *
 * Stop with Ctrl+C.
 */

import { configureLogger } from '@just-in/core';
import { JustInServerless } from '@just-in/engine';
import { SetRandomTagTask } from './mock-task';
import { LogRandomTagRule } from './mock-decision-rule';
import { MOCK_USERS } from './mock-users';

const EVENT_TYPE = 'DEMO_CLOCK_EVENT';
const INTERVAL_MS = 30_000;
let tickCount = 0;

configureLogger({ level: 'INFO' });

async function runInvocation(): Promise<void> {
  tickCount++;
  const now = new Date().toISOString();

  console.log('');
  console.log(`╔═══════════════════════════════════════════════╗`);
  console.log(`║  INVOCATION #${String(tickCount).padEnd(3)}  ${now}  ║`);
  console.log(`╚═══════════════════════════════════════════════╝`);

  try {
    console.log(`\n[setup] Loading ${MOCK_USERS.length} users...`);
    const users = await JustInServerless.loadUsers(MOCK_USERS);
    console.log(`[setup] Loaded: ${users.map(u => u.uniqueIdentifier).join(', ')}`);

    JustInServerless.registerTask(SetRandomTagTask);
    JustInServerless.registerDecisionRule(LogRandomTagRule);
    await JustInServerless.registerEventHandlers(EVENT_TYPE, [
      SetRandomTagTask.name,
      LogRandomTagRule.name,
    ]);
    console.log(`[setup] Handlers: ${SetRandomTagTask.name} → ${LogRandomTagRule.name}`);

    console.log(`\n[event] Publishing ${EVENT_TYPE}...`);
    await JustInServerless.publishEvent(EVENT_TYPE, new Date(), {
      triggeredAt: now,
      tick: tickCount,
    });

    console.log(`\n[done]  Invocation #${tickCount} complete.`);
  } catch (err) {
    console.error(`\n[error] Invocation #${tickCount} failed:`, err);
  } finally {
    JustInServerless.reset();
    console.log(`[reset] Engine state cleared for next invocation.`);
  }
}

console.log('');
console.log('  JustIn Serverless Demo Runner');
console.log('  ──────────────────────────────');
console.log(`  Event type : ${EVENT_TYPE}`);
console.log(`  Interval   : ${INTERVAL_MS / 1000}s`);
console.log(`  Users      : ${MOCK_USERS.map(u => u.uniqueIdentifier).join(', ')}`);
console.log('');
console.log('  Press Ctrl+C to stop.');
console.log('');

runInvocation();
const timer = setInterval(runInvocation, INTERVAL_MS);

process.on('SIGINT', () => {
  clearInterval(timer);
  JustInServerless.reset();
  console.log('\n\n  Stopped. Goodbye.\n');
  process.exit(0);
});
