import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '../../../server/router';
import { NextApiRequest, NextApiResponse } from 'next';

export default createNextApiHandler({
  router: appRouter,
  createContext: ({ req, res }: { req: NextApiRequest; res: NextApiResponse }) => ({
    req,
    res,
  }),
});
