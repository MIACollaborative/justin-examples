import {
  JustInServer,
  HTTPMethods,
  Logger,
  ServerConfiguration,
  Endpoint,
  Request,
  Response,
  RequestHandler,
  Guard,
  Controller,
  getAuthenticationGuard,
  getSelfGuard,
  getRoleEndpointGuard,
  RoleEndpointGuard,
} from "@just-in/server";
import {
  configureDB,
  configureLogger,
  createLogger,
  DBType,
  UserManager,
} from "@justin-consortium/core";
import { UserHelper } from "./lib/user-helper";

const Log = createLogger({
  context: {
    source: "server-essential",
  },
});

configureLogger({
  emitFn: (entry, ctx) => {
    const line = `[${entry.severity}] ${JSON.stringify({ message: entry.message, ...ctx })}`;
    if (entry.severity === "DEBUG") console.debug(line);
    else if (entry.severity === "WARNING") console.warn(line);
    else if (entry.severity === "ERROR") console.error(line);
    else console.log(line);
  },
});

const config: ServerConfiguration = {
  enableTransactionLogging: true,
  db: {
    dbType: DBType.MONGO,
    uri:
      process.env.MONGO_URI ??
      "mongodb://localhost:27017/server_essential?replicaSet=rs0",
  },
};

Log.debug("Configuring DB...");
configureDB({ dbType: DBType.MONGO, uri: process.env.MONGO_URI as string });

await UserManager.init();

// Load users from CSV and create them in the database
// TODO: revisit 
Log.debug("Loading users from CSV...");
const usersToAdd = await UserHelper.loadUsers();
Log.debug(`Loaded ${usersToAdd.length} users from CSV. Creating users...`);
await UserManager.createUsers(usersToAdd);
Log.debug("Users created.");

const server = JustInServer(config);
const port = process.env.PORT || 3001;

server
  .start(port)
  .then(() => {
    Log.info(`Server started`);
  })
  .catch((err: Error) => {
    Log.error("Error starting server", { error: err });
  });
