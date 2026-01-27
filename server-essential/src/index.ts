import { AppServer, HTTPMethods, Logger, AppServerConfiguration, Endpoint, Request, Response, RequestHandler, Guard, Controller, createLogger, AuthenticationGuard, getRoleEndpointGuard, RoleEndpointGuard } from '@just-in/server';
import { usersGuardsMap, guardOverride, guardGeneric, guardThrowError, requestTokenValidatorGuard } from "./guards/index";
import util from 'util';


const Log = createLogger({
  context: {
    source: 'my-app-server',
  },
});

let customConfig: AppServerConfiguration | undefined = undefined;


customConfig = {
  enableTransactionLogging: true,
};

// option 1: let the server create its own JustIn instance
const server = AppServer(customConfig);
const port = process.env.PORT || 3001;


const roleEndpointGuard: RoleEndpointGuard = getRoleEndpointGuard();

// this doesn't have to be in the database,
// but we could imagine that other extensions or modules might want to 
// access the database even prior to the server starting.
roleEndpointGuard.defineRoleEndpointAccess("admin", [{
  path: '/api/users',
  methodConfig: {
    allow: ["*"],
    deny: []
  }
}, {
  path: '/api/protected',
  methodConfig: {
    allow: ["*"],
    deny: [HTTPMethods.DELETE]
  }
}]);

roleEndpointGuard.defineRoleEndpointAccess("participant", [{
  path: '/api/users',
  methodConfig: {
    allow: [],
    deny: ["*"]
  }
}, {
  path: '/api/protected',
  methodConfig: {
    allow: [],
    deny: ["*"]
  }
}]);

// Ah... user manager is not intitiated, yet.
roleEndpointGuard.assignRoleToUsers("admin", ["P1"]);
roleEndpointGuard.assignRoleToUsers("participant", ["P1, P2"]);


server.registerEndpoint(
  {
    path: '/api/test/auth', method: HTTPMethods.GET, guards: [AuthenticationGuard, roleEndpointGuard], controller: (req: Request, res: Response) => { res.send(`Hello ${req["userId"]}, You are authenticated!`); }
  }
);






// optionally, assign your own logger
/*
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
  debug: (message?: any, ...optionalParams: any[]) => {
    console.debug(`[Example] ${message}`, ...optionalParams);
  },
};
*/

//server.configureLogger(myLogger);

// v2: use Endpoint solely as interface

// register a new endpoint
// server.registerEndpoint({path: '/api/test/hello', method: HTTPMethods.GET, guards: [guardThrowError], controller: (req, res) => { res.send('Hello!'); }});
// do it twice will throw an error
// server.registerEndpoint({path: '/api/test/hello', method: HTTPMethods.GET, guards: [guardThrowError], controller: (req, res) => { res.send('Hello!'); }});

// register a default endpoint -> throw error
// server.registerEndpoint({path: '/api/users', method: HTTPMethods.GET, guards: [guardThrowError], controller: (req, res) => { res.send('Hello!'); }});

// override a default endpoint
// server.overrideDefaultEndpoint({path: '/api/users', method: HTTPMethods.GET, guards: [guardOverride]});

// override a non-existing endpoint -> throw an error
// server.overrideDefaultEndpoint({path: '/api/notexist', method: HTTPMethods.GET, guards: []});

// override a custom endpoint (non-default) -> throw an error.
// server.overrideDefaultEndpoint({path: '/api/test/hello', method: HTTPMethods.GET, guards: [guardOverride]});


// get an endpoint that does not exist -> error
// const usersGetEndpoint: Endpoint | null = server.getEndpoint('/api/notexist', HTTPMethods.GET) as Endpoint;


/*
const usersGetEndpoint: Endpoint | null = server.getEndpoint('/api/users', HTTPMethods.GET) as Endpoint;
Log.info("Users get endpoint:", util.inspect(usersGetEndpoint));


// get default guards

const guards = usersGetEndpoint.getGuards();
console.log("Guards:", guards.map((guard: Guard) => guard.name));

// override guards
usersGetEndpoint.setGuards([guardThrowError]);
console.log("Guards after setGuards:", server.getEndpoint('/api/users', HTTPMethods.GET)!.getGuards().map((guard: Guard) => guard.name));
*/

// get default controller

/*
const controller = usersGetEndpoint.getController();
console.log("Controller:", controller.toString());

// override controller
const newController: Controller = (req: Request, res: Response) => { throw new Error("Controller throwing error"); };
usersGetEndpoint.setController(newController);
console.log("Controller after setController:", server.getEndpoint('/api/users', HTTPMethods.GET)!.getController().toString());
*/

/*
// add a new endpoint
const newEndpointConfig = {path: '/api/test/hello', method: HTTPMethods.GET, guards: [guardGeneric], controller: (req: Request, res: Response) => { res.send('Hello!'); }};

const newEndpoint:Endpoint = server.registerEndpoint(newEndpointConfig) as Endpoint;
console.log("New endpoint added:", util.inspect(newEndpoint));

server.registerEndpoint(newEndpointConfig) as Endpoint;
console.log("New endpoint added:", util.inspect(newEndpoint));
*/


// try overriding all guards
/*
server.getAllEndpoints().forEach((endpoint: Endpoint) => {
  endpoint.setGuards([guardOverride]);
});
*/

// start the server, which includes initializing justin and database connection
server.start(port)
  .then(() => {
    Log.info(`Server started`);
  })
  .catch((err: Error) => {
    Log.error("Error starting server:", err);
  });

