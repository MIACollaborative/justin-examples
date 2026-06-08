import { JustInServer, HTTPMethods, Logger, ServerConfiguration, Endpoint, Request, Response, RequestHandler, Guard, Controller, getAuthenticationGuard, getSelfGuard, getRoleEndpointGuard, RoleEndpointGuard } from '@just-in/server';
import { configureLogger, createLogger, DBType } from '@justin-consortium/core';

const Log = createLogger({
  context: {
    source: 'server-essential',
  },
});

configureLogger({
  emitFn: (entry, ctx) => {
    const line = `[${entry.severity}] ${JSON.stringify({ message: entry.message, ...ctx })}`;
    if (entry.severity === 'DEBUG') console.debug(line);
    else if (entry.severity === 'WARNING') console.warn(line);
    else if (entry.severity === 'ERROR') console.error(line);
    else console.log(line);
  },
});

const config: ServerConfiguration = {
  enableTransactionLogging: true,
  db: {
    dbType: DBType.MONGO,
    uri: process.env.MONGO_URI ?? "mongodb://localhost:27017/justin?replicaSet=rs0",
  },
};

const server = JustInServer(config);
const port = process.env.PORT || 3001;

server.start(port)
  .then(() => {
    Log.info(`Server started`);
  })
  .catch((err: Error) => {
    Log.error("Error starting server", { error: err });
  });

