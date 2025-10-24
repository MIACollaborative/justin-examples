import { JAppServer, DEFAULT_GUARDS, HTTPMethods, JustIn, Log, Logger, JAppServerConfiguration } from '@just-in/server';
import { usersGuardsMap, guardOverride, guardGeneric, requestTokenValidatorGuard } from "./guards/index"

// option 2: pass in your own JustIn instance

const justIn = JustIn();

let customConfig: JAppServerConfiguration | undefined  = undefined;


customConfig = {
  endpointGuardsMap: usersGuardsMap,

  // TODO: we will decide whether to do it this way and if it is needed.
  // I will setup a method for people to setLoggingLevels through the server instance.
  justIn: justIn
};



// set your logging levels here, before passing into server
justIn.setLoggingLevels({
  dev: true,
  info: true,
  warn: true,
  error: true
});

// option 1: let the server create its own JustIn instance
const server = JAppServer(customConfig);
const port = process.env.PORT || 3001;




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
//server.configureLogger(myLogger);

/*
// override guards, leave the controller intact
server.overrideDefaultEndpoint({path: '/api/users', method: HTTPMethods.GET, guards: [guardOverride]});

// add a new guard, and override existing controller
server.overrideDefaultEndpoint(
  {path: '/api/users/:userUniqueIdentifier', method: HTTPMethods.DELETE, guards: [...DEFAULT_GUARDS, guardOverride], 
    controller: (req, res) => { res.send('User deleted (not actually) - overridden'); }}
);

// Issue a warning, as /api/notexist is not handled by default configuration
server.overrideDefaultEndpoint({path: '/api/notexist', method: HTTPMethods.GET, guards: []});
*/
// add new endpoints
// note that the did not use default guards
server.registerEndpoint({path: '/api/test/hello', method: HTTPMethods.GET, guards: [guardOverride], controller: (req, res) => { res.send('Hello!'); }});

/*
server.registerEndpoint({path: '/api/test/hi', method: HTTPMethods.GET, guards: [guardOverride], controller: (req, res) => { res.send('Hi!'); }});
server.registerEndpoint({path: '/api/test/yo', method: HTTPMethods.GET, guards: [guardOverride], controller: (req, res) => { res.send('Yo!'); }});
server.registerEndpoint({path: '/api/test/token', method: HTTPMethods.GET, guards: [requestTokenValidatorGuard], controller: (req, res) => { res.send('Token!'); }});
*/

// This one should error out, because it is overlapping with default endpoint
//server.registerEndpoint({path: '/api/users/:userUniqueIdentifier', method: HTTPMethods.DELETE, guards: [guardOverride], controller: (req, res) => { res.send('User deleted (not actually)'); }});


// start the server, which includes initializing justin and database connection
server.start(port)
.then(() => {
  Log.info(`Server started`);
})
.catch((err: Error) => {
  Log.error("Error starting server:", err);
});

