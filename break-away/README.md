
# Break-Away

This example app shows how to write and run Decision Rules using `justin-core`. To run this app you will need a few things in place:
1. A mongo server that JustIn can connect to. (See the top level [README](../) for setup options/instructions.)
2. Credentials for using [MailJet](https://mailjet.com)
3. A URL to a form where users can submit their self-response data.

### Configure environment settings

Create a file named ".env" in the root of the project folder with the following content:

```bash
MONGO_URI="mongodb://127.0.0.1:27017?retryWrites=true&w=majority"
DB_NAME="justin"
MAILJET_API_KEY="[mailjet api key]"
MAILJET_SECRET_KEY="[mailjet secret key]"
VERIFIED_SENDER_EMAIL="[email sender address]"
CHECKIN_FORM_LINK="[google form url with parameter for pre-filled email]"

```

### Add some users

Modify `content/users.csv` to include information about your test users, such as an email address that you can check to verify break-away is working. The break-away app will read this file and load the users from it each time it is run.

### Run the app

Type `yarn start` to launch break-away. You will see some logging output, and should start receiving emails in an hour or so. 

Of course you might not want to wait that long, so you can change the variable `minutesBetweenEmails` in the file `src/decision-rules/screen-break-email.dr.ts` to something smaller, like `2`. Restart the app and your emails will flow more quickly!