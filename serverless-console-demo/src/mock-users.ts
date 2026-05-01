import type { ServerlessUserInput } from '@just-in/engine';

/**
 * Mock users for the demo runner.
 * In a real deployment these would come from an external source
 * (Firestore, REST API, etc.) fetched at the start of each invocation.
 */
export const MOCK_USERS: ServerlessUserInput[] = [
  {
    uniqueIdentifier: 'alice',
    attributes: { name: 'Alice', cohort: 'A' },
  },
  {
    uniqueIdentifier: 'bob',
    attributes: { name: 'Bob', cohort: 'B' },
  },
  {
    uniqueIdentifier: 'carol',
    attributes: { name: 'Carol', cohort: 'A' },
  },
];
