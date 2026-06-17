import {
  JustInServer,
  ServerConfiguration,
  createBetterAuthAdapter,
} from "@just-in/server";
import {
  configureDB,
  configureLogger,
  createLogger,
  DBType,
  UserManager,
  DataManager,
} from "@justin-consortium/core";
import { UserHelper } from "./lib/user-helper.js";
import { BetterAuthUserHelper } from "./lib/better-auth-user-helper.js";
import { DBHelper } from "./lib/db-helper.js";
import { auth, identityCache } from "./auth.js";
import { MONGO_URI, DB_NAME } from "./config.js";

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

Log.debug("Configuring DB...");
configureDB({ dbType: DBType.MONGO, dbName: DB_NAME, uri: MONGO_URI });
await DataManager.getInstance().init();
await DBHelper.dropCollections();

const authAdapter = createBetterAuthAdapter(auth, {
  resolveUserId: identityCache.wrap(async ({ id: betterAuthId }) => {
    const allUsers = UserManager.getAllUsers();
    for (const user of allUsers) {
      const attrs = UserManager.getProtectedAttributesForUser(user.id, ["auth-identity"]);
      const record = attrs.find((a) => a.namespace === "auth-identity");
      if (record?.protectedAttributes?.betterAuthId === betterAuthId) {
        return user.uniqueIdentifier;
      }
    }
    return null;
  }),
});

const config: ServerConfiguration = {
  enableTransactionLogging: true,
  auth: authAdapter,
};



await UserManager.init();

// Load users from CSV and create them in the database
// TODO: revisit 
Log.debug("Loading users from CSV...");
const usersToAdd = await UserHelper.loadUsers();
const newUsers = usersToAdd.filter(
  (u) => UserManager.getUserByUniqueIdentifier(u.uniqueIdentifier) === null
);
Log.debug(`Loaded ${usersToAdd.length} users from CSV. Creating ${newUsers.length} new users...`);
if (newUsers.length > 0) await UserManager.createUsers(newUsers);
Log.debug("Users created.");

Log.debug("Seeding better-auth users...");
await BetterAuthUserHelper.seedUsers("./content/users.csv");
Log.debug("better-auth users seeded.");

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
