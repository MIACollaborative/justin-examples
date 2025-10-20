// This is the example server script that shows how to use just-in server
// It is here for demonstration / testing purposes only
// This will not be part of the actual just-in server package

import { JAppServer, DEFAULT_GUARDS, HTTPMethods, Logger } from '@just-in/server';
import JustIn, { Log } from '@just-in/core';
import { guardGeneric, requestTokenValidatorGuard } from "./guards/index"

// option 1: let the server create its own JustIn instance
const server = JAppServer();
const port = process.env.PORT || 3001;

// option 2: pass in your own JustIn instance
/*
const justIn = JustIn();

// set your logging levels here, before passing into server
justIn.setLoggingLevels({
  dev: false,
  info: true,
  warn: true,
  error: true
});
*/

// optionally, assign your own logger
// otherwise it will use the default console logger (Log) from just-in core
const myLogger: Logger = {
  info: (message?: any, ...optionalParams: any[]) => {
    console.log(`[Example] ${message}`, ...optionalParams);
  },
  warn: (message?: any, ...optionalParams: any[]) => {
    console.warn(`[Example] ${message}`, ...optionalParams);
  },
  error: (message?: any, ...optionalParams: any[]) => {
    console.error(`[Example] ${message}`, ...optionalParams);
  },
  dev: (message?: any, ...optionalParams: any[]) => {
    console.debug(`[Example] ${message}`, ...optionalParams);
  },
};
server.configureLogger(myLogger);

// override guards, leave the controller intact
server.overrideDefaultEndpoint({path: '/api/users', method: HTTPMethods.GET, guards: [guardGeneric]});

// add a new guard, and override existing controller
server.overrideDefaultEndpoint(
  {path: '/api/users/:userUniqueIdentifier', method: HTTPMethods.DELETE, guards: [...DEFAULT_GUARDS, guardGeneric], 
    controller: (req, res) => { res.send('User deleted (not actually) - overridden'); }}
);

// Issue a warning, as /api/notexist is not handled by default configuration
server.overrideDefaultEndpoint({path: '/api/notexist', method: HTTPMethods.GET, guards: []});

// add new endpoints
// note that the did not use default guards
server.registerEndpoint({path: '/api/test/hello', method: HTTPMethods.GET, guards: [guardGeneric], controller: (req, res) => { res.send('Hello!'); }});
server.registerEndpoint({path: '/api/test/hi', method: HTTPMethods.GET, guards: [guardGeneric], controller: (req, res) => { res.send('Hi!'); }});
server.registerEndpoint({path: '/api/test/yo', method: HTTPMethods.GET, guards: [guardGeneric], controller: (req, res) => { res.send('Yo!'); }});
server.registerEndpoint({path: '/api/test/token', method: HTTPMethods.GET, guards: [requestTokenValidatorGuard], controller: (req, res) => { res.send('Token!'); }});

// This one should error out, because it is overlapping with default endpoint
//server.registerEndpoint({path: '/api/users/:userUniqueIdentifier', method: HTTPMethods.DELETE, guards: [guardGeneric], controller: (req, res) => { res.send('User deleted (not actually)'); }});


// start the server, which includes initializing justin and database connection
server.start(port)
.then(() => {
  Log.info(`Server started`);
})
.catch((err: Error) => {
  Log.error("Error starting server:", err);
});

