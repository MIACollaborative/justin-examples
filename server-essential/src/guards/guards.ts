import { Guard, Request, Response, NextFunction, createLogger } from "@just-in/server";

const Log = createLogger({
  context: {
    source: 'guard',
  },
});

const guardCustom: Guard = (req: Request, res: Response, next: NextFunction) => {
  Log.debug('Custom guard!');
  next();
}

const guardOverride: Guard = (req: Request, res: Response, next: NextFunction) => {
  Log.debug('Override guard!');
  next();
};

const guardGeneric: Guard = (req: Request, res: Response, next: NextFunction) => {
  Log.debug('Generic guard!');
  next();
};

const requestTokenValidatorGuard: Guard = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (token === 'valid-token') {
      Log.debug(`${requestTokenValidatorGuard.name}: Request Validator Guard: valid token`);
      next();
      return;
    }
  }
  Log.debug(`${requestTokenValidatorGuard.name}: Request Validator Guard: invalid or missing token`);
  res.status(401).json({ error: 'Unauthorized' });
};

export { guardCustom, guardOverride, guardGeneric, requestTokenValidatorGuard };
