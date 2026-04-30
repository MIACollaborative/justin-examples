// TODO: see if this can be done at the server package.
import { Request } from '@just-in/server';

declare module '@just-in/server' {
  interface Request {
    userId?: string;
  }
}
