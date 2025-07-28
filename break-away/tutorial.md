# JustIn Sample App: Break Away

## Step 1: initialize JustIn task engine

Install the `justin` package
```
yarn add justin
```

In `index.js`, import `JustIn` and `Log` module from the `justin/task-engine` package.

```
import { JustIn, Log } from 'justin/task-engine';
import { DBType } from 'justin/core';
```

Add user password to `.env`
```
PT1_EMAIL="[participant 1 email]"
PT2_EMAIL="[participant 2 email]"
```

Initialize database and load users
```
await JustIn.initializeDB(DBType.MONGO);
await JustIn.addUsersToDatabase([
    {participantId: "pt1", email: process.env.PT1_EMAIL, attributes: {timezone: "America/Detroit"}},
    {participantId: "pt2", email: process.env.PT2_EMAIL, attributes: {timezone: "America/Chicago"}},
]);
```

## Step 2: add mailjet credentials

Install the `node-mailjet` package
```
yarn add node-mailjet
```

Add mailjet API key and secret key to `.env`

```
MAILJET_API_KEY="[mailjet api key]"
MAILJET_SECRET_KEY="[mailjet secret key]"
```

# Step 3: create a decision rule

Create decision-rule-1.ts
```
import { StepReturnResult } from '@just-in/core';

/* Will add implementation later */

export const BreakAwayDecisionRule = {
  name: 'BreakAwayDecisionRule',
  shouldActivate,
  selectAction,
  doAction
};

```

## Step 3: criteria step (shouldActivate)

```
const shouldActivate = async (user: any): Promise<StepReturnResult<any>> => {
  return {
    status: 'success',
    result: 'hell yea',
  };
};
```

## Step 4: intervention selection step (selectAction function)

```
const selectAction = async (user: any): Promise<StepReturnResult<any>> => {
  // check the time
  let status = ExecutionStatus.STOP;
  
  export enum ExecutionStatus {
  SUCCESS = "success",
  STOP = 'stop',
  ERROR = "error",
}
  return { status: ExecutionStatus.SUCCESS, result: {} };
};

```

## Step 5: intervention delivery step (doAction function)

```
const doAction = async (
  user: any
): Promise<StepReturnResult<{ message: string }>> => {
  const message = 'HOOOZAH';
  console.log(message);
  return { status: 'success', result: { message } };
};
```

## Step 6: register the decision rule

```
await JustIn.registerClockEvent('ClockEvent', 1000, [ BreakAwayDecisionRule.name,]);
```

## Step 6: start the engine

```
await justIn.startEngine();
```

## Step 7: run the app

```
yarn start
```