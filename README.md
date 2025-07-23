# justin-examples

## Getting Started

The current recommended way to use this framework is to fork the repository and write your own application in the /src/apps folder.

### Install the basics

We use yarn as our package manager.

Yarn: https://yarnpkg.com/

### Install MongoDB
Instructions: [download MongoDB community edition](https://www.mongodb.com/docs/manual/administration/install-community/)

### Create folder for storing data

On Mac, create /data/mdata under the home folder, or  ~/data/mdata.

On Windows, create \data\db under the c disk, or c:\data\db.


### Run MongoDB

In command line/terminal:

```bash

# Mac: create ~/data/mdata folder first, and then run the following command in the terminal:
mongod --port 27017 --dbpath ~/data/mdata --replSet rs0 --bind_ip localhost

# Windows: create C:\datea\db  folder first, and then run the following command in the terminal:
mongod  --port 27017 --dbpath "c:\data\db" --replSet rs0 --bind_ip localhost

```
### Install MongoDB GUI

Downlaod [MongoDB compass](https://www.mongodb.com/products/compass) for database GUI (or use command line if you prefer)

### Configure environment settings

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
