
# Break-Away

This example app shows how to write and run Decision Rules using `justin-core`. To run this app you will need a few things in place:
1. A mongo server that JustIn can connect to. (See XXX for setup options/instructions.)
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