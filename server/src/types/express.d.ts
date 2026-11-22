import 'express-session';
import type { User } from '@elitequest/shared';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    session: Express.Session;
    user?: User;
  }
}

export {};
