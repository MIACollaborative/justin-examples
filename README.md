# justin-examples

## Try the examples

To use the examples in this repo, clone the repo and cd into the example directory you want to try (e.g., `break-away`). You can also create new app folders and write your own! Refer to the config files (e.g., package.json, tsconfig.json) in break-away or other example app directories for what you'll need.

Be sure to check out the example app's README for any instructions related to that app.

## Install MongoDB

JustIn requires a MongoDB server with replica sets in order to work. These instructions cover how to set up a local instance of MongoDB for testing and playing with the examples.

### Download MongoDB Community Edition

[Download MongoDB community edition](https://www.mongodb.com/docs/manual/administration/install-community/)

### Create folder for storing data

On Mac, create a `/data/mdata` directory in your home directory (`$ mkdir ~/data/mdata`).

On Windows, create a `\data\db` directory at the top level of your C: drive, or (`mkdir c:\data\db`).

### Run MongoDB

In your command line/terminal:

```bash

mongod --port 27017 --dbpath ~/data/mdata --replSet rs0 --bind_ip localhost

```
### Install MongoDB GUI (Optional)

If you want to see the data that JustIn creates and modifies in Mongo, you can use [MongoDB compass](https://www.mongodb.com/products/compass) for exploring the DB, or you can use [mongosh](https://www.mongodb.com/docs/mongodb-shell/) from the command line.

