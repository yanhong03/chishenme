/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Utensils, 
  RefreshCw, 
  MapPin, 
  Sun, 
  ChevronLeft, 
  Star, 
  Lightbulb, 
  Calendar as CalendarIcon,
  AlertCircle,
  Database
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { cn } from './lib/utils';
import { type Dish, type DayMenu } from './constants';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://yhishsoojbucamcyolws.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_tPuqwof7re20oiMKBsJ8Eg_OcArX3KS';

// Direct Supabase client for fallback
const directSupabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type View = 'home' | 'loading' | 'result' | 'menu';

const API_BASE = '/api';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [dailyCount, setDailyCount] = useState(0);
  const [weeklyMenu, setWeeklyMenu] = useState<DayMenu[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [isDirectMode, setIsDirectMode] = useState(false);
  const [weather, setWeather] = useState<{ temp: number; condition: string }>({ temp: 20, condition: 'Sunny' });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real weather (Via Backend Proxy for stability)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Try backend proxy first (more reliable for domestic users)
        const res = await fetch(`${API_BASE}/weather`);
        if (!res.ok) throw new Error('Proxy failed');
        const data = await res.json();
        
        if (data.current_weather) {
          setWeather({
            temp: Math.round(data.current_weather.temperature),
            condition: data.current_weather.weathercode <= 3 ? 'Sunny' : 'Cloudy'
          });
        }
      } catch (e) {
        console.warn('Weather proxy failed, trying direct fallback...');
        try {
          // Direct fallback if proxy fails
          const lat = 40.0155;
          const lon = 116.4158;
          const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
          const data = await res.json();
          if (data.current_weather) {
            setWeather({
              temp: Math.round(data.current_weather.temperature),
              condition: data.current_weather.weathercode <= 3 ? 'Sunny' : 'Cloudy'
            });
          }
        } catch (err) {
          console.error('All weather sources failed:', err);
        }
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 1800000);
    return () => clearInterval(interval);
  }, []);

  // Fetch initial data
  const fetchData = useCallback(async (forceDirect = false) => {
    setIsLoadingData(true);
    setFetchError(null);
    try {
      if (!forceDirect) {
        // Try Proxy first
        console.log('Attempting to fetch via Proxy...');
        const [menuRes, dishesRes] = await Promise.all([
          fetch(`${API_BASE}/menu`),
          fetch(`${API_BASE}/dishes`)
        ]);

        if (menuRes.ok && dishesRes.ok) {
          const menuData = await menuRes.json();
          const dishesData = await dishesRes.json();
          setWeeklyMenu(menuData);
          setDishes(dishesData);
          setIsDirectMode(false);
        } else {
          throw new Error(`API Error: ${menuRes.status} / ${dishesRes.status}`);
        }
      } else {
        // Direct Supabase Fallback
        console.log('Attempting direct Supabase connection...');
        const [{ data: menuData, error: menuErr }, { data: dishesData, error: dishesErr }] = await Promise.all([
          directSupabase.from('weekly_menu').select('*'),
          directSupabase.from('dishes').select('*')
        ]);

        if (menuErr || dishesErr) throw menuErr || dishesErr;
        
        setWeeklyMenu(menuData || []);
        setDishes(dishesData || []);
        setIsDirectMode(true);
      }
    } catch (err: any) {
      console.error('Fetch Error:', err);
      if (!forceDirect) {
        console.warn('Proxy failed, switching to direct mode...');
        fetchData(true); // Retry with direct mode
      } else {
        setFetchError(err.message || 'Network Error');
      }
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Initialize daily count from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('lastOpenDate');
    const storedCount = localStorage.getItem('dailyOpenCount');

    if (storedDate !== today) {
      localStorage.setItem('lastOpenDate', today);
      localStorage.setItem('dailyOpenCount', '0');
      setDailyCount(0);
    } else {
      setDailyCount(parseInt(storedCount || '0', 10));
    }
  }, []);

  const handleOpenBlindBox = async () => {
    if (dailyCount >= 2 || dishes.length === 0) return;

    setView('loading');
    
    // Record opening on backend
    try {
      await fetch(`${API_BASE}/blind-box/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: 'local-user' })
      });
    } catch (err) {
      console.error('Failed to log opening:', err);
    }

    setTimeout(() => {
      const randomDish = dishes[Math.floor(Math.random() * dishes.length)];
      setSelectedDish(randomDish);
      const newCount = dailyCount + 1;
      setDailyCount(newCount);
      localStorage.setItem('dailyOpenCount', newCount.toString());
      setView('result');
    }, 2000);
  };

  const handleRetry = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleOpenBlindBox();
  };

  const currentDayMenu = useMemo(() => {
    if (weeklyMenu.length === 0) return null;
    
    // Get current day index (0-6, where 0 is Sunday)
    const today = currentTime.getDay();
    const dayMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    
    // Map to Mon-Fri. If Sat(6) or Sun(0), default to Mon('周一')
    let targetDayName = dayMap[today];
    if (today === 0 || today === 6) {
      targetDayName = '周一';
    }
    
    // Find by day name in the menu array
    const menu = weeklyMenu.find(m => m.day === targetDayName);
    return menu || weeklyMenu[0];
  }, [weeklyMenu, currentTime]);

  const rotatedMenu = useMemo(() => {
    if (weeklyMenu.length === 0) return [];
    
    const today = currentTime.getDay();
    const dayMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    
    // Start from today if Mon-Fri, otherwise start from Mon
    let startDayName = dayMap[today];
    if (today === 0 || today === 6) {
      startDayName = '周一';
    }
    
    // Find the index of the start day in the weeklyMenu array
    const startIndexInArray = weeklyMenu.findIndex(m => m.day === startDayName);
    const safeStartIndex = startIndexInArray !== -1 ? startIndexInArray : 0;
    
    const result = [];
    for (let i = 0; i < weeklyMenu.length; i++) {
      const idx = (safeStartIndex + i) % weeklyMenu.length;
      result.push(weeklyMenu[idx]);
    }
    return result;
  }, [weeklyMenu, currentTime]);

  if (isLoadingData) {
    return (
      <div className="h-screen w-full flex items-center justify-center editorial-gradient">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <RefreshCw className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (fetchError || (!currentDayMenu && view === 'home')) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center editorial-gradient p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-primary mb-2">服务暂时不可用</h2>
        <p className="text-on-surface-variant text-sm mb-6">
          {fetchError ? `错误详情: ${fetchError}` : '请检查网络连接或稍后再试'}
        </p>
        <div className="flex flex-col gap-3 w-full">
          <button 
            onClick={() => fetchData(false)}
            className="px-8 py-3 bg-primary text-white rounded-full font-bold shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            重试 (代理模式)
          </button>
          <button 
            onClick={() => fetchData(true)}
            className="px-8 py-3 bg-surface-container text-primary rounded-full font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Database className="w-4 h-4" />
            直连数据库
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full max-w-md mx-auto overflow-hidden editorial-gradient shadow-2xl">
      <AnimatePresence mode="wait">
        {view === 'home' && currentDayMenu && (
          <motion.div 
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HomeView 
              onOpen={handleOpenBlindBox} 
              onShowMenu={() => setView('menu')} 
              todayMenu={currentDayMenu}
              canOpen={dailyCount < 2}
              weather={weather}
              time={currentTime}
            />
          </motion.div>
        )}
        {view === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoadingView />
          </motion.div>
        )}
        {view === 'result' && selectedDish && (
          <motion.div 
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ResultView 
              dish={selectedDish} 
              onRetry={handleRetry} 
              onClose={() => setView('home')} 
              canRetry={dailyCount < 2}
            />
          </motion.div>
        )}
        {view === 'menu' && (
          <motion.div 
            key="menu"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <MenuView 
              menu={rotatedMenu}
              onBack={() => setView('home')} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background silhouettes */}
      <div className="fixed bottom-0 left-0 w-full h-32 -z-10 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute bottom-[-20px] left-[-20px] w-64 h-64 bg-primary rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[-40px] right-[-20px] w-48 h-48 bg-secondary-container rounded-full blur-[60px]"></div>
      </div>
    </div>
  );
}

function HomeView({ onOpen, onShowMenu, todayMenu, canOpen, weather, time }: { 
  onOpen: () => void; 
  onShowMenu: () => void; 
  todayMenu: DayMenu; 
  canOpen: boolean;
  weather: { temp: number; condition: string };
  time: Date;
}) {
  const timeString = time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  const dateString = time.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' });
  
  return (
    <div className="flex flex-col min-h-screen pt-24 pb-12 px-8">
      <header className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center justify-center py-4 gap-1 bg-surface/80 backdrop-blur-xl shadow-sm max-w-md mx-auto">
        <div className="flex items-center text-primary font-bold tracking-tight font-headline text-base">
          <MapPin className="w-4 h-4 mr-1" />
          <span>北京 · 仰山公园</span>
        </div>
        <div className="flex flex-col items-center text-on-surface-variant text-[10px] font-medium opacity-75">
          <div className="flex items-center gap-1">
            <Sun className="w-3 h-3 text-secondary" />
            <span>{weather.temp}°C · {weather.condition} · {timeString}</span>
          </div>
          <div className="mt-0.5">{dateString}</div>
        </div>
      </header>

      <section className="flex flex-col items-center text-center mb-12">
        <motion.div 
          className="text-8xl mb-6 cursor-default"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          🍱
        </motion.div>
        <h1 className="text-4xl font-extrabold text-primary font-headline tracking-tighter mb-2">
          午饭吃啥呢
        </h1>
        <p className="text-on-surface-variant font-medium opacity-80">
          午饭终结者：戳一下，看天意
        </p>
      </section>

      <button 
        onClick={onOpen}
        disabled={!canOpen}
        className={cn(
          "w-full py-5 mb-16 rounded-xl text-xl font-extrabold font-headline transition-all flex items-center justify-center gap-2",
          canOpen 
            ? "bg-secondary-container text-on-secondary-container shadow-[0_12px_32px_rgba(253,139,0,0.25)] active:scale-95" 
            : "bg-surface-container text-on-surface-variant opacity-50 cursor-not-allowed"
        )}
      >
        {canOpen ? "开启盲盒 ✨" : "今日次数已达上限 🍱"}
      </button>

      <section className="w-full space-y-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-[2px] w-8 bg-primary/10"></div>
          <h2 className="text-primary font-bold text-lg font-headline tracking-tight">今日菜单 🍱</h2>
          <div className="h-[2px] w-8 bg-primary/10"></div>
        </div>

        <div className="bg-surface-container-low rounded-lg p-6 text-center border border-primary/5 shadow-sm">
          <h3 className="text-primary font-bold mb-4 flex items-center justify-center gap-2">
            <span className="text-xl">🍱</span> 今日套餐
          </h3>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-primary/60 uppercase tracking-widest block mb-1">荤菜</span>
              <p className="text-on-surface font-semibold text-lg">{todayMenu.combo.meat.join(' · ')}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-primary/60 uppercase tracking-widest block mb-1">素菜</span>
              <p className="text-on-surface font-semibold text-lg">{todayMenu.combo.veg.join(' · ')}</p>
            </div>
            <div>
              <span className="text-xs font-bold text-primary/60 uppercase tracking-widest block mb-1">主食</span>
              <p className="text-on-surface font-semibold text-lg">{todayMenu.combo.staple.join(' · ')}</p>
            </div>
          </div>
        </div>

        <div className="bg-surface-container rounded-lg p-6 text-center border border-primary/5 shadow-sm">
          <h3 className="text-primary font-bold mb-4 flex items-center justify-center gap-2">
            <span className="text-xl">🥟</span> 今日小吃
          </h3>
          <ul className="space-y-3">
            {todayMenu.snacks.map((snack, i) => (
              <li key={i} className="flex flex-col">
                <span className="text-[10px] font-bold text-primary/40">档口 {i + 1}</span>
                <span className="text-on-surface font-medium">{snack.split('：')[1] || snack}</span>
              </li>
            ))}
          </ul>
        </div>

        {todayMenu.others && todayMenu.others.length > 0 && (
          <div className="bg-surface-container-high rounded-lg p-6 text-center border border-primary/5 shadow-sm">
            <h3 className="text-primary font-bold mb-4 flex items-center justify-center gap-2">
              <span className="text-xl">🥣</span> 今日小菜/汤/水果
            </h3>
            <div className="space-y-3">
              {todayMenu.others.map((item, i) => (
                <p key={i} className="text-on-surface font-medium">
                  {item}
                </p>
              ))}
            </div>
          </div>
        )}
      </section>

      <footer className="mt-12 w-full flex flex-col items-center gap-6">
        <button 
          onClick={onShowMenu}
          className="w-full py-4 border-2 border-dashed border-outline-variant text-on-surface-variant font-bold rounded-lg hover:bg-surface-container transition-colors text-sm"
        >
          [ 查看本周菜单全貌 ]
        </button>
        <p className="text-[10px] text-outline tracking-wider font-medium">
          备注：小吃或套餐任选一种
        </p>
      </footer>
    </div>
  );
}

function LoadingView() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center px-8 editorial-gradient">
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-secondary-container/5 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center space-y-8">
        <div className="relative">
          <div className="text-7xl animate-spoon select-none">🥄</div>
          <div className="mt-4 w-12 h-1.5 bg-primary/10 rounded-full blur-sm mx-auto opacity-60"></div>
        </div>
        
        <div className="space-y-3 max-w-[280px]">
          <h1 className="font-headline font-bold text-xl leading-tight tracking-tight text-primary">
            正在仰山公园为您寻找灵感...
          </h1>
          <p className="font-body text-sm text-on-surface-variant/70 tracking-wide">
            正在准备一份自然的惊喜
          </p>
        </div>
        
        <div className="w-16 h-1 bg-surface-container rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-primary rounded-full"
            animate={{ x: [-64, 64] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            style={{ width: '40%' }}
          />
        </div>
      </div>

      <div className="absolute bottom-12 flex flex-col items-center space-y-2 opacity-30">
        <span className="font-headline font-extrabold text-xs tracking-[0.2em] text-primary uppercase">Yangshan Park</span>
        <div className="flex gap-1">
          <span className="w-1 h-1 rounded-full bg-primary"></span>
          <span className="w-1 h-1 rounded-full bg-primary"></span>
          <span className="w-1 h-1 rounded-full bg-primary"></span>
        </div>
      </div>
    </div>
  );
}

function ResultView({ dish, onRetry, onClose, canRetry }: { dish: Dish; onRetry: (e: React.MouseEvent) => void; onClose: () => void; canRetry: boolean }) {
  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 glass-overlay"
    >
      <motion.article 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-sm bg-surface-container-lowest rounded-xl shadow-2xl overflow-hidden flex flex-col items-center text-center p-8 border border-outline-variant/15"
      >
        <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-primary-fixed/30 blur-3xl"></div>
        <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-secondary-fixed/20 blur-3xl"></div>
        
        <header className="mb-8 relative">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-fixed mb-4">
            <Utensils className="text-primary w-8 h-8" />
          </div>
          <h1 className="font-headline font-extrabold text-2xl text-on-surface tracking-tight leading-tight">
            🎉 恭喜你，今日有口福！
          </h1>
        </header>

        <section className="mb-10 w-full">
          <div className="py-6 px-4 rounded-lg bg-surface-container-low border border-primary/5">
            <p className="text-primary font-headline font-bold text-3xl tracking-wide">
              [{dish.name}]
            </p>
            {dish.recommendation && (
              <div className="mt-3 flex items-center justify-center gap-2">
                <Star className="w-4 h-4 text-secondary fill-secondary" />
                <span className="text-on-surface-variant text-xs font-medium uppercase tracking-widest">{dish.recommendation}</span>
              </div>
            )}
          </div>
        </section>

        {dish.tip && (
          <section className="mb-8 w-full p-5 rounded-lg bg-surface-bright flex items-start gap-4 text-left border-l-4 border-secondary">
            <Lightbulb className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
            <p className="text-on-surface-variant text-sm leading-relaxed font-medium">
              {dish.tip}
            </p>
          </section>
        )}

        {dish.quote && (
          <footer className="mb-10 italic">
            <p className="text-on-surface-variant/70 text-sm font-medium tracking-tight">
              {dish.quote}
            </p>
          </footer>
        )}

        <div className="w-full flex flex-col gap-3">
          {canRetry && (
            <button 
              onClick={onRetry}
              className="w-full py-4 px-8 bg-secondary-container text-on-secondary-container rounded-full font-headline font-bold text-lg shadow-lg active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <RefreshCw className="w-5 h-5" />
              再摇一次
            </button>
          )}

          <button 
            onClick={onClose}
            className="w-full py-4 px-8 bg-primary text-white rounded-full font-headline font-bold text-lg shadow-lg active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
          >
            返回
          </button>
        </div>

        <button 
          onClick={onClose}
          className="mt-6 text-on-surface-variant/50 text-xs font-medium uppercase tracking-widest hover:text-primary transition-colors"
        >
          Tap anywhere to dismiss
        </button>
      </motion.article>
    </div>
  );
}

function MenuView({ menu, onBack }: { menu: DayMenu[]; onBack: () => void }) {
  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center px-8 h-16 bg-surface/80 backdrop-blur-xl max-w-md mx-auto">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-bold text-primary font-headline tracking-tight">午饭吃啥呢</h1>
          <Sun className="w-5 h-5 text-secondary" />
        </div>
      </header>

      <main className="mt-20 px-6 pb-24 w-full flex flex-col items-center text-center">
        <div className="mb-10 w-full">
          <div className="inline-block px-4 py-1 rounded-full bg-primary-fixed text-on-primary-fixed text-xs font-bold mb-3 tracking-widest uppercase">
            Weekly Special
          </div>
          <h2 className="text-3xl font-headline font-extrabold text-primary mb-2 flex items-center justify-center gap-2">
            <CalendarIcon className="w-8 h-8" /> 本周午餐菜单
          </h2>
        </div>

        <div className="space-y-8 w-full flex flex-col items-center">
          {menu.map((day) => (
            <section key={day.day} className="w-full bg-surface-container-low p-8 rounded-lg relative overflow-hidden group shadow-sm">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-6xl">{day.icon}</span>
              </div>
              <h3 className="text-xl font-headline font-bold text-primary mb-6 flex items-center justify-center gap-2">
                <span>{day.dayEn}</span>
                <span className="h-1 w-8 bg-secondary-container rounded-full"></span>
                <span>{day.day}</span>
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-secondary font-bold text-sm mb-2">套餐 🍱</p>
                  <div className="space-y-1">
                    {day.combo.meat.length > 1 || day.combo.veg.length > 1 ? (
                      <>
                        <p className="text-on-surface font-semibold">荤菜：{day.combo.meat.join('、')}</p>
                        <p className="text-on-surface font-semibold">素菜：{day.combo.veg.join('、')}</p>
                        <p className="text-on-surface font-semibold">主食：{day.combo.staple.join('、')}</p>
                      </>
                    ) : (
                      <p className="text-on-surface font-semibold">
                        {[...day.combo.meat, ...day.combo.veg, ...day.combo.staple].join('、')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="pt-4 border-t border-primary/5">
                  <p className="text-secondary font-bold text-sm mb-2">小吃 🍜</p>
                  {day.snacks.map((snack, i) => (
                    <p key={i} className="text-on-surface">{snack}</p>
                  ))}
                </div>
                <div className="pt-4 border-t border-primary/5">
                  <p className="text-secondary font-bold text-sm mb-2">其它 🥣</p>
                  <p className="text-on-surface">{day.others.join('、')}</p>
                </div>
              </div>
            </section>
          ))}
        </div>

        <button 
          onClick={onBack}
          className="mt-12 mb-10 group flex items-center gap-3 bg-primary-container text-white px-10 py-4 rounded-full font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>返回</span>
        </button>

        <footer className="text-[10px] uppercase tracking-widest text-on-surface-variant/50 pb-8">
          Created for Yangshan Park Lunch Service
        </footer>
      </main>
    </div>
  );
}
