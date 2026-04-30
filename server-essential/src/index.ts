import { JustInServer, HTTPMethods, Logger, ServerConfiguration, Endpoint, Request, Response, RequestHandler, Guard, Controller, createLogger, getAuthenticationGuard, SelfGuard, getSelfGuard, getRoleEndpointGuard, RoleEndpointGuard, UserManager, configureDB, DBType } from '@just-in/server';
import { usersGuardsMap, guardOverride, guardGeneric, guardThrowError, requestTokenValidatorGuard } from "./guards/index";
import * as util from 'util';

//configureDB({ dbType: DBType.MONGO, uri: process.env.MONGO_URI? process.env.MONGO_URI : "mongodb://localhost:27017/justin?replicaSet=rs0" });
    

const Log = createLogger({
  context: {
    source: 'my-app-server',
  },
});

let customConfig: ServerConfiguration | undefined = undefined;


customConfig = {
  enableTransactionLogging: true,
};

// option 1: let the server create its own JustIn instance
const server = JustInServer(customConfig);
const port = process.env.PORT || 3001;

// TODO: revisit to see if this step can be inlcuded in a server method
await UserManager.init();


// start the server, which includes initializing justin and database connection
server.start(port)
  .then(() => {
    Log.info(`Server started`);
  })
  .catch((err: Error) => {
    Log.error("Error starting server:", err);
  });

