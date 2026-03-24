-- SQL to set up Supabase tables

-- 1. Weekly Menu Table
CREATE TABLE weekly_menu (
  id SERIAL PRIMARY KEY,
  day TEXT NOT NULL,
  day_en TEXT NOT NULL,
  icon TEXT NOT NULL,
  combo JSONB NOT NULL,
  snacks TEXT[] NOT NULL,
  others TEXT[] NOT NULL
);

-- 2. Dishes Table
CREATE TABLE dishes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  recommendation TEXT,
  tip TEXT,
  quote TEXT
);

-- 3. Blind Box Logs Table
CREATE TABLE blind_box_logs (
  id SERIAL PRIMARY KEY,
  device_id TEXT NOT NULL,
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  date DATE NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE weekly_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blind_box_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to weekly_menu" ON weekly_menu FOR SELECT USING (true);
CREATE POLICY "Allow public read access to dishes" ON dishes FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to blind_box_logs" ON blind_box_logs FOR INSERT WITH CHECK (true);

-- Insert sample data for weekly_menu
INSERT INTO weekly_menu (day, day_en, icon, combo, snacks, others) VALUES
('周一', 'Monday', '🥬', '{"meat": ["红烧肉"], "veg": ["蒜蓉菜心"], "staple": ["五谷米饭"]}', '{"1号档口：老北京炸酱面"}', '{"番茄蛋汤", "时令水果"}'),
('周二', 'Tuesday', '🍗', '{"meat": ["宫保鸡丁"], "veg": ["手撕包菜"], "staple": ["香甜糯米"]}', '{"2号档口：广式烧鸭粉丝汤"}', '{"排骨山药汤", "香蕉"}'),
('周三', 'Wednesday', '🥟', '{"meat": ["粉蒸肉", "黑椒鸡块"], "veg": ["干锅包菜", "酸辣土豆丝"], "staple": ["米饭", "蒸馒头"]}', '{"1号档口：重庆小面", "2号档口：扬州炒饭"}', '{"紫菜虾皮汤", "西瓜"}'),
('周四', 'Thursday', '🥗', '{"meat": ["回锅肉", "红烧排骨"], "veg": ["地三鲜", "蒜泥生菜"], "staple": ["玉米饭", "杂粮卷"]}', '{"3号档口：金汤肥牛面"}', '{"冬瓜肉丸汤", "哈密瓜"}'),
('周五', 'Friday', '🍱', '{"meat": ["红烧鱼块"], "veg": ["西红柿炒蛋"], "staple": ["白米饭"]}', '{"特色窗口：自助小火锅"}', '{"绿豆沙汤", "苹果"}');

-- Insert sample data for dishes
INSERT INTO dishes (name, recommendation, tip, quote) VALUES
('水煮肉 (清真)', 'HIGHLY RECOMMENDED', '别忘了去2号档口配个小炒肉饭', '🌊 吃饱了去仰山湖边消消食...'),
('红烧狮子头', 'CHEF''S CHOICE', '汤汁拌饭简直一绝', '🌳 在绿意盎然中享受美味'),
('老北京炸酱面', 'LOCAL FAVORITE', '多加点黄瓜丝更清爽', '🍜 这一口，是地道的北京味'),
('广式蜜汁叉烧饭', 'SWEET & SAVORY', '记得淋上秘制酱汁', '✨ 每一口都是满满的幸福感');
