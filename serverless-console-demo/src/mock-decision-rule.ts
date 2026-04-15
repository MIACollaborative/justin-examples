import { createLogger } from '@just-in/core';
import type { JUser } from '@just-in/core';
import type { JEvent, DecisionRuleRegistration, StepReturnResult } from '@just-in/engine';

const Log = createLogger({ context: { package: 'serverless-console-demo', component: 'log-random-tag-rule' } });

/**
 * Demo decision rule — reads the demoTag set by SetRandomTagTask and logs a
 * personalised message. STOPs cleanly if no tag is found on the user.
 */
export const LogRandomTagRule: DecisionRuleRegistration = {
  name: 'log-random-tag-rule',

  beforeExecution: async (): Promise<void> => {
    Log.info('Starting user sweep.');
  },

  shouldActivate: async (user: JUser, _event: JEvent): Promise<StepReturnResult> => {
    const attrs = user.attributes as Record<string, unknown> | undefined;
    const tag =
      attrs?.['demoTag'] ??
      (attrs?.['customFields'] as Record<string, unknown> | undefined)?.['demoTag'];

    if (!tag) {
      return { status: 'stop', result: { reason: 'demoTag not found on user' } };
    }
    return { status: 'success', result: { tag } };
  },

  selectAction: async (_user: JUser, _event: JEvent, prev: StepReturnResult): Promise<StepReturnResult> => {
    return {
      status: 'success',
      result: {
        action: 'SEND_MESSAGE',
        tag: prev.result?.['tag'],
        message: `User tag is ${prev.result?.['tag']}`,
      },
    };
  },

  doAction: async (user: JUser, _event: JEvent, prev: StepReturnResult): Promise<StepReturnResult> => {
    if (prev.result?.['action'] === 'SEND_MESSAGE') {
      Log.info(`→ ${user.uniqueIdentifier}: ${prev.result?.['message']}`);
    }
    return { status: 'success', result: prev.result };
  },

  afterExecution: async (): Promise<void> => {
    Log.info('User sweep complete.');
  },
};
