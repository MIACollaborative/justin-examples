import { AppServer, DEFAULT_GUARDS, HTTPMethods, JustIn, Log, Logger, AppServerConfiguration, EndpointManager, Endpoint, Request, Response, RequestHandler, Guard } from '@just-in/server';
import { usersGuardsMap, guardOverride, guardGeneric, guardThrowError, requestTokenValidatorGuard } from "./guards/index";
import util from 'util';

// option 2: pass in your own JustIn instance

const justIn = JustIn();

let customConfig: AppServerConfiguration | undefined  = undefined;


customConfig = {
  //endpointGuardsMap: usersGuardsMap,

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
const server = AppServer(customConfig);
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

// v2: use Endpoint solely as interface

// register a new endpoint
//server.registerEndpointV2({path: '/api/test/hello', method: HTTPMethods.GET, guards: [guardThrowError], controller: (req, res) => { res.send('Hello!'); }});
// do it twice will throw an error
// server.registerEndpointV2({path: '/api/test/hello', method: HTTPMethods.GET, guards: [guardThrowError], controller: (req, res) => { res.send('Hello!'); }});

// override a default endpoint
//server.overrideDefaultEndpointV2({path: '/api/users', method: HTTPMethods.GET, guards: [guardOverride]});

// override a non-existing endpoint -> throw an error
// server.overrideDefaultEndpointV2({path: '/api/notexist', method: HTTPMethods.GET, guards: []});

// override a custom endpoint (non-default)
// server.overrideDefaultEndpointV2({path: '/api/test/hello', method: HTTPMethods.GET, guards: [guardOverride]});


const usersGetEndpoint: Endpoint | null = server.getEndpoint('/api/users', HTTPMethods.GET) as Endpoint;
Log.info("Users get endpoint:", util.inspect(usersGetEndpoint));
// get default guards
const guards = usersGetEndpoint.getGuards();
console.log("Guards:", guards.map((guard: Guard) => guard.getName()));

// override guards
usersGetEndpoint.setGuards([guardThrowError]);
console.log("Guards after setGuards:", server.getEndpoint('/api/users', HTTPMethods.GET)!.getGuards().map((guard: Guard) => guard.getName()));

// get default controller
/*
const controller = usersGetEndpoint.getController();
console.log("Controller:", controller.toString());

// override controller
const newController: RequestHandler = (req: Request, res: Response) => { res.send('New controller!'); };
usersGetEndpoint.setController(newController);
console.log("Controller after setController:", server.getEndpoint('/api/users', HTTPMethods.GET)!.getController().toString());
*/


// original methods




// try overriding all guards
// TODO: provide getEndpoints method in server
/*
server.getAllEndpoints().forEach((endpoint: Endpoint) => {
  endpoint.setGuards([guardOverride]);
});
*/

// v1: use Endpoint as interface, still using JEndpointsConfiguration (basePath) and JEndpointConfiguration
/*
const usersGetEndpoint: Endpoint | null = EndpointManager.getEndpoint('/api/users', HTTPMethods.GET);

if (usersGetEndpoint) {
  // get default guards
  const guards = usersGetEndpoint.getGuards();
  console.log("Guards:", guards.map((guard: JGuard) => guard.getName()));

  // override guards
  usersGetEndpoint.setGuards([guardOverride]);
  console.log("Guards after setGuards:", EndpointManager.getEndpoint('/api/users', HTTPMethods.GET)!.getGuards().map((guard: JGuard) => guard.getName()));

  // get default controller
  const controller = usersGetEndpoint.getController();
  console.log("Controller:", controller.toString());
  
  // override controller
  const newController: RequestHandler = (req: Request, res: Response) => { res.send('New controller!'); };
  usersGetEndpoint.setController(newController);
  console.log("Controller after setController:", EndpointManager.getEndpoint('/api/users', HTTPMethods.GET)!.getController().toString());
}

// add a new endpoint
const newEndpointConfig = {path: '/api/test/hello', method: HTTPMethods.GET, guards: [guardGeneric], controller: (req: Request, res: Response) => { res.send('Hello!'); }};

const newEndpoint:Endpoint = EndpointManager.addEndpoint(newEndpointConfig) as Endpoint;
console.log("New endpoint added:", util.inspect(newEndpoint));


const allEndpointRoutes: EndpointRoute[] = EndpointManager.getAllEndpointRoutes();
console.log("All endpoint routes:", allEndpointRoutes);


const allEndpointBases: string[] = EndpointManager.getAllEndpointBases();
console.log("All endpoint bases:", allEndpointBases);
*/

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

// add new endpoints
// note that the did not use default guards
server.registerEndpoint({path: '/api/test/hello', method: HTTPMethods.GET, guards: [guardOverride], controller: (req, res) => { res.send('Hello!'); }});

server.registerEndpoint({path: '/api/test/hi', method: HTTPMethods.GET, guards: [guardOverride], controller: (req, res) => { res.send('Hi!'); }});
server.registerEndpoint({path: '/api/test/yo', method: HTTPMethods.GET, guards: [guardOverride], controller: (req, res) => { res.send('Yo!'); }});
server.registerEndpoint({path: '/api/test/token', method: HTTPMethods.GET, guards: [requestTokenValidatorGuard], controller: (req, res) => { res.send('Token!'); }});
*/

// This one should error out, because it is overlapping with default endpoint
//server.registerEndpointV2({path: '/api/users/:userUniqueIdentifier', method: HTTPMethods.DELETE, guards: [guardOverride], controller: (req, res) => { res.send('User deleted (not actually)'); }});


// start the server, which includes initializing justin and database connection
server.start(port)
.then(() => {
  Log.info(`Server started`);
})
.catch((err: Error) => {
  Log.error("Error starting server:", err);
});

