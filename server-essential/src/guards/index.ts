import { JGuard, Request, Response, NextFunction, Log } from "@just-in/server";

/**
 * A generic guard that allows all requests.
 * This guard simply logs and allows all requests to proceed.
 */
const guardGeneric: JGuard = Object.assign(
  /**
   * A generic guard based on Express middleware
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  (req: Request, res: Response, next: NextFunction) => {
    Log.dev('Generic guard!');
    next();
  },
  {
    /**
     * Returns the name of the guard.
     */
    getName: () => 'guardGeneric',
    /**
     * Returns the configuration for the guard.
     */
    getConfiguration: () => ({ description: 'A generic guard that allows all requests.' })
  }
);

/**
 * A generic permission guard that allows all requests.
 * This guard logs and allows all requests to proceed, simulating permission checks.
 */
const permissionGuardGeneric: JGuard = Object.assign(
  /**
   * A generic permission guard based on Express middleware.
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  (req: Request, res: Response, next: NextFunction) => {
    Log.dev('Generic permission guard: all pass');
    next();
  },
  {
    /**
     * Returns the name of the permission guard.
     */
    getName: () => 'Permission Guard Generic',
    /**
     * Returns the configuration for the permission guard.
     */
    getConfiguration: () => ({ description: 'A generic permission guard that allows all requests.' })
  }
);

/**
 * A request validator guard that checks for a valid bearer token.
 * This guard checks for an Authorization header with a valid token.
 */
const requestTokenValidatorGuard: JGuard = Object.assign(
  /**
   * Express middleware for the request token validator guard.
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      if (token === 'valid-token') {
        Log.dev(`${requestTokenValidatorGuard.getName()}: Request Validator Guard: valid token`);
        next();
        return;
      }
    }
    Log.dev(`${requestTokenValidatorGuard.getName()}: Request Validator Guard: invalid or missing token`);
    res.status(401).json({ error: 'Unauthorized' });
  },
  {
    /**
     * Returns the name of the request token validator guard.
     */
    getName: () => 'Reqquest Token Validator Guard',
    /**
     * Returns the configuration for the request token validator guard.
     */
    getConfiguration: () => ({ description: 'A request validator guard that checks for a valid bearer token.' })
  }
);

export { guardGeneric, permissionGuardGeneric, requestTokenValidatorGuard };