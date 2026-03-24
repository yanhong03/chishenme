import { createServer } from '../server';

let cachedApp: any = null;

export default async (req: any, res: any) => {
  try {
    if (!cachedApp) {
      console.log('Initializing new Express app instance for Vercel');
      cachedApp = await createServer();
    }
    return cachedApp(req, res);
  } catch (err: any) {
    console.error('Vercel Entry Point Error:', err);
    res.status(500).json({ 
      error: 'Vercel Entry Point Error', 
      message: err.message,
      stack: err.stack 
    });
  }
};
