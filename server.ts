import express from 'express';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://yhishsoojbucamcyolws.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_tPuqwof7re20oiMKBsJ8Eg_OcArX3KS';

let supabase: any = null;

function getSupabase() {
  if (!supabase) {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.warn('⚠️ SUPABASE_URL or SUPABASE_ANON_KEY is missing. Using mock data for development.');
      return null;
    }
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
}

// Mock data for development when Supabase is not configured
const MOCK_MENU = [
  { id: 1, day: '周一', day_en: 'Monday', icon: '🥬', combo: { meat: ['红烧肉'], veg: ['蒜蓉菜心'], staple: ['五谷米饭'] }, snacks: ['1号档口：老北京炸酱面'], others: ['番茄蛋汤', '时令水果'] },
  { id: 2, day: '周二', day_en: 'Tuesday', icon: '🍗', combo: { meat: ['宫保鸡丁'], veg: ['手撕包菜'], staple: ['香甜糯米'] }, snacks: ['2号档口：广式烧鸭粉丝汤'], others: ['排骨山药汤', '香蕉'] },
  { id: 3, day: '周三', day_en: 'Wednesday', icon: '🥟', combo: { meat: ['粉蒸肉', '黑椒鸡块'], veg: ['干锅包菜', '酸辣土豆丝'], staple: ['米饭', '蒸馒头'] }, snacks: ['1号档口：重庆小面', '2号档口：扬州炒饭'], others: ['紫菜虾皮汤', '西瓜'] },
  { id: 4, day: '周四', day_en: 'Thursday', icon: '🥗', combo: { meat: ['回锅肉', '红烧排骨'], veg: ['地三鲜', '蒜泥生菜'], staple: ['玉米饭', '杂粮卷'] }, snacks: ['3号档口：金汤肥牛面'], others: ['冬瓜肉丸汤', '哈密瓜'] },
  { id: 5, day: '周五', day_en: 'Friday', icon: '🍱', combo: { meat: ['红烧鱼块'], veg: ['西红柿炒蛋'], staple: ['白米饭'] }, snacks: ['特色窗口：自助小火锅'], others: ['绿豆沙汤', '苹果'] }
];

const MOCK_DISHES = [
  { id: 1, name: '水煮肉 (清真)', recommendation: 'HIGHLY RECOMMENDED', tip: '别忘了去2号档口配个小炒肉饭', quote: '🌊 吃饱了去仰山湖边消消食...' },
  { id: 2, name: '红烧狮子头', recommendation: 'CHEF\'S CHOICE', tip: '汤汁拌饭简直一绝', quote: '🌳 在绿意盎然中享受美味' },
  { id: 3, name: '老北京炸酱面', recommendation: 'LOCAL FAVORITE', tip: '多加点黄瓜丝更清爽', quote: '🍜 这一口，是地道的北京味' },
  { id: 4, name: '广式蜜汁叉烧饭', recommendation: 'SWEET & SAVORY', tip: '记得淋上秘制酱汁', quote: '✨ 每一口都是满满的幸福感' }
];

const app = express();

async function createServer() {
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get('/api/menu', async (req, res) => {
    try {
      const client = getSupabase();
      if (!client) {
        return res.json(MOCK_MENU);
      }

      const { data, error } = await client
        .from('weekly_menu')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error('Supabase error:', error);
      res.json(MOCK_MENU); // Fallback to mock data on error
    }
  });

  app.get('/api/dishes', async (req, res) => {
    try {
      const client = getSupabase();
      if (!client) {
        return res.json(MOCK_DISHES);
      }

      const { data, error } = await client
        .from('dishes')
        .select('*');

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error('Supabase error:', error);
      res.json(MOCK_DISHES); // Fallback to mock data on error
    }
  });

  // Record an opening (for analytics or server-side tracking if needed)
  app.post('/api/blind-box/open', async (req, res) => {
    try {
      const client = getSupabase();
      if (!client) {
        return res.json({ success: true, mock: true });
      }

      const { device_id } = req.body;
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await client
        .from('blind_box_logs')
        .insert([{ device_id, opened_at: new Date().toISOString(), date: today }]);

      if (error) throw error;
      res.json({ success: true });
    } catch (error: any) {
      console.error('Supabase error:', error);
      res.json({ success: true, mock: true });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

// For local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  createServer().then((app) => {
    const PORT = 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  });
}

export default app;
export { createServer };
