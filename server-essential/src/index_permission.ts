import { AppServer, HTTPMethods, JustIn, Log, Logger, AppServerConfiguration, Endpoint, Request, Response, RequestHandler, Guard, Controller } from '@just-in/server';
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

// TODO: continually refine the prototype (contract)
/*
// Permission-based access control
server.defineRolePermission("admin", ["read::users", "write::users", "update::users", "delete::users"]);
server.assignRolesToUser("user123", ["admin"]);
server.registerEndpoint({path: '/api/users', method: HTTPMethods.GET, guards: [PermissionsGuard(["read::users"])], controller: (req, res) => { res.send('Hello!'); }});

// Role-based access control
server.registerEndpoint({path: '/api/users', method: HTTPMethods.GET, guards: [RolesGuard(["admin", "participant"])], controller: (req, res) => { res.send('Hello!'); }});


// Endpoint-based access control
server.defineRoleEndpointAccess("admin", [{ path: '/api/users', method: HTTPMethods.GET }, { path: '/api/users', method: HTTPMethods.POST }]);
server.registerEndpoint({path: '/api/users', method: HTTPMethods.GET, guards: [RoleEndpointGuard()], controller: (req, res) => { res.send('Hello!'); }});
*/

//server.configureLogger(myLogger);

// start the server, which includes initializing justin and database connection
server.start(port)
.then(() => {
  Log.info(`Server started`);
})
.catch((err: Error) => {
  Log.error("Error starting server:", err);
});

