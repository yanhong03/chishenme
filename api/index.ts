import { createServer } from '../server';

let cachedApp: any = null;

export default async (req: any, res: any) => {
  if (!cachedApp) {
    console.log('Initializing new Express app instance for Vercel');
    cachedApp = await createServer();
  }
  return cachedApp(req, res);
};
