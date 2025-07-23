# justin-examples

## Configure environment settings

Create a file named ".env" in the root of the project folder with the following content:

```bash
MONGO_URI="mongodb://127.0.0.1:27017?retryWrites=true&w=majority"
DB_NAME="justin"
MAILJET_API_KEY="[mailjet api key]"
MAILJET_SECRET_KEY="[mailjet secret key]"
VERIFIED_SENDER_EMAIL="[email sender address]"
CHECKIN_FORM_LINK="[google form url with parameter for pre-filled email]"
TEST_RECIPIENT_EMAIL_1="[recipient 1 email address]"
TEST_RECIPIENT_EMAIL_2="[recipient 2 email address]"

```
