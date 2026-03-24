export interface Dish {
  name: string;
  recommendation?: string;
  tip?: string;
  quote?: string;
}

export interface DayMenu {
  day: string;
  dayEn: string;
  combo: {
    meat: string[];
    veg: string[];
    staple: string[];
  };
  snacks: string[];
  others: string[];
  icon: string;
}

export const WEEKLY_MENU: DayMenu[] = [
  {
    day: "周一",
    dayEn: "Monday",
    icon: "🥬",
    combo: {
      meat: ["红烧肉"],
      veg: ["蒜蓉菜心"],
      staple: ["五谷米饭"]
    },
    snacks: ["1号档口：老北京炸酱面"],
    others: ["番茄蛋汤", "时令水果"]
  },
  {
    day: "周二",
    dayEn: "Tuesday",
    icon: "🍗",
    combo: {
      meat: ["宫保鸡丁"],
      veg: ["手撕包菜"],
      staple: ["香甜糯米"]
    },
    snacks: ["2号档口：广式烧鸭粉丝汤"],
    others: ["排骨山药汤", "香蕉"]
  },
  {
    day: "周三",
    dayEn: "Wednesday",
    icon: "🥟",
    combo: {
      meat: ["粉蒸肉", "黑椒鸡块"],
      veg: ["干锅包菜", "酸辣土豆丝"],
      staple: ["米饭", "蒸馒头"]
    },
    snacks: ["1号档口：重庆小面", "2号档口：扬州炒饭"],
    others: ["紫菜虾皮汤", "西瓜"]
  },
  {
    day: "周四",
    dayEn: "Thursday",
    icon: "🥗",
    combo: {
      meat: ["回锅肉", "红烧排骨"],
      veg: ["地三鲜", "蒜泥生菜"],
      staple: ["玉米饭", "杂粮卷"]
    },
    snacks: ["3号档口：金汤肥牛面"],
    others: ["冬瓜肉丸汤", "哈密瓜"]
  },
  {
    day: "周五",
    dayEn: "Friday",
    icon: "🍱",
    combo: {
      meat: ["红烧鱼块"],
      veg: ["西红柿炒蛋"],
      staple: ["白米饭"]
    },
    snacks: ["特色窗口：自助小火锅"],
    others: ["绿豆沙汤", "苹果"]
  }
];

export const DISHES: Dish[] = [
  {
    name: "水煮肉 (清真)",
    recommendation: "HIGHLY RECOMMENDED",
    tip: "别忘了去2号档口配个小炒肉饭",
    quote: "🌊 吃饱了去仰山湖边消消食..."
  },
  {
    name: "红烧狮子头",
    recommendation: "CHEF'S CHOICE",
    tip: "汤汁拌饭简直一绝",
    quote: "🌳 在绿意盎然中享受美味"
  },
  {
    name: "老北京炸酱面",
    recommendation: "LOCAL FAVORITE",
    tip: "多加点黄瓜丝更清爽",
    quote: "🍜 这一口，是地道的北京味"
  },
  {
    name: "广式蜜汁叉烧饭",
    recommendation: "SWEET & SAVORY",
    tip: "记得淋上秘制酱汁",
    quote: "✨ 每一口都是满满的幸福感"
  },
  {
    name: "麻婆豆腐",
    recommendation: "SPICY & TENDER",
    tip: "豆腐滑嫩，麻辣适口，非常下饭",
    quote: "🌶️ 这一口，是川味的灵魂"
  },
  {
    name: "鱼香肉丝",
    recommendation: "CLASSIC TASTE",
    tip: "酸甜适中，木耳清脆，肉丝鲜嫩",
    quote: "🥢 经典的家常味道，百吃不厌"
  },
  {
    name: "地三鲜",
    recommendation: "VEGETARIAN DELIGHT",
    tip: "土豆、茄子、青椒的完美结合",
    quote: "🥔 大地的馈赠，朴实而美味"
  },
  {
    name: "糖醋里脊",
    recommendation: "KIDS' FAVORITE",
    tip: "外酥里嫩，酸甜可口，色泽红亮",
    quote: "🍭 甜蜜的味道，心情也变好了"
  },
  {
    name: "西红柿炒鸡蛋",
    recommendation: "HOME STYLE",
    tip: "最简单的食材，最温馨的味道",
    quote: "🍳 每一个中国胃的终极慰藉"
  },
  {
    name: "青椒炒肉丝",
    recommendation: "SIMPLE & GOOD",
    tip: "青椒清脆，肉丝滑嫩，咸鲜适口",
    quote: "🫑 简单的一餐，也是生活的滋味"
  },
  {
    name: "干煸豆角",
    recommendation: "CRUNCHY & SAVORY",
    tip: "豆角干香，肉末鲜美，微辣开胃",
    quote: "🥬 越嚼越香，根本停不下来"
  },
  {
    name: "蚝油生菜",
    recommendation: "FRESH & LIGHT",
    tip: "生菜脆爽，蚝油鲜香，健康首选",
    quote: "🥗 清淡饮食，给身体减减负"
  },
  {
    name: "酸菜鱼",
    recommendation: "SOUR & SPICY",
    tip: "鱼片鲜嫩，酸菜开胃，汤头浓郁",
    quote: "🐟 酸爽过瘾，连汤都能喝三碗"
  },
  {
    name: "宫保鸡丁",
    recommendation: "WORLD FAMOUS",
    tip: "鸡丁滑嫩，花生酥脆，甜辣适中",
    quote: "🥜 闻名中外的经典，必点之选"
  }
];
