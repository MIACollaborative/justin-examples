import { createLogger } from '@just-in/core';
import type { JUser } from '@just-in/core';
import type { JEvent, TaskRegistration, StepReturnResult } from '@just-in/engine';

const Log = createLogger({ context: { package: 'serverless-console-demo', component: 'set-random-tag-task' } });

/**
 * Demo task — assigns a random short tag to each user and mirrors it into
 * attributes.customFields.demoTag. The downstream decision rule reads this
 * tag to decide what message to log.
 */
export const SetRandomTagTask: TaskRegistration = {
  name: 'set-random-tag-task',

  beforeExecution: async (): Promise<void> => {
    Log.info('Starting user sweep.');
  },

  shouldActivate: async (_user: JUser, _event: JEvent): Promise<StepReturnResult> => {
    return { status: 'success', result: { reason: 'always-on' } };
  },

  doAction: async (user: JUser, _event: JEvent): Promise<StepReturnResult> => {
    const tag = `tag_${Math.random().toString(36).slice(2, 8)}`;

    user.attributes = user.attributes ?? {};
    (user.attributes as Record<string, unknown>).demoTag = tag;

    const cf = ((user.attributes as Record<string, unknown>).customFields ?? {}) as Record<string, unknown>;
    (user.attributes as Record<string, unknown>).customFields = { ...cf, demoTag: tag };

    Log.info(`Set demoTag=${tag} for ${user.uniqueIdentifier}.`);

    return { status: 'success', result: { field: 'demoTag', value: tag } };
  },

  afterExecution: async (): Promise<void> => {
    Log.info('User sweep complete.');
  },
};
