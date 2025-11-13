import { Guard, AppServerError, Request, Response, NextFunction, Log, RequestHandler } from "@just-in/server";

function createGuard(
  name: string,
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void> | void
): Guard {
  const fn = ((req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next);
  }) as Partial<Guard>;

  Object.defineProperty(fn, 'name', { value: name });

  return fn as Guard;
}


const guardThrowError = createGuard('guardThrowError', (req: Request, res: Response, next: NextFunction) => {
  const msg = 'Throw error guard!';

  // Log.dev(msg);

  // you can throw anything in Javascript, although not recommended
  // throw msg;

  // throw regular error in typical case
  throw new Error(msg);

  // throw AppServerError if devs want complete control over the error response
  //throw new AppServerError(msg);

  next();
});


/*
const guardThrowError: Guard = Object.assign(

   function guardThrowError(req: Request, res: Response, next: NextFunction) {
    Log.dev('Throw error guard!');
    throw new Error('Throw error guard!');
    next();
  },
  {

    getName: () => 'guardThrowError',
    getConfiguration: () => ({ description: 'A guard that throws an error.' })
  }
);
*/


/**
 * A custom guard that allows all requests.
 * This guard simply logs and allows all requests to proceed.
 */
const guardCustom: Guard = (req: Request, res: Response, next: NextFunction) => {
  Log.dev('Custom guard!');
  next();
}

/**
 * A custom guard that allows all requests.
 * This guard simply logs and allows all requests to proceed.
 */
const guardOverride: Guard = (req: Request, res: Response, next: NextFunction) => {
  Log.dev('Override guard!');
  next();
};


/**
 * A generic guard that allows all requests.
 * This guard simply logs and allows all requests to proceed.
 */
const guardGeneric: Guard = (req: Request, res: Response, next: NextFunction) => {
  Log.dev('Generic guard!');
  next();
};

/**
 * A request validator guard that checks for a valid bearer token.
 * This guard checks for an Authorization header with a valid token.
 */
const requestTokenValidatorGuard: Guard = (req: Request, res: Response, next: NextFunction) => {

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (token === 'valid-token') {
      Log.dev(`${requestTokenValidatorGuard.name}: Request Validator Guard: valid token`);
      next();
      return;
    }
  }
  Log.dev(`${requestTokenValidatorGuard.name}: Request Validator Guard: invalid or missing token`);
  res.status(401).json({ error: 'Unauthorized' });
};



export { guardCustom, guardOverride, guardGeneric, guardThrowError, requestTokenValidatorGuard };