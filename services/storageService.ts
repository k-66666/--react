import { AppData, Product, DailyLogEntry, TableRowData, OperationLog } from '../types';

const STORAGE_KEY = 'smart_stock_master_v1';

// Full product list based on user image data
const DEFAULT_PRODUCTS: Product[] = [
  // 1-3: Alcohol
  { id: '1', name: '赛伊港酿红', unit: '瓶', price: 0, category: '酒水' },
  { id: '2', name: '玫瑰气泡酒', unit: '瓶', price: 0, category: '酒水' },
  { id: '3', name: '特级赤夏珠', unit: '瓶', price: 0, category: '酒水' },
  
  // 4-8: Beer
  { id: '4', name: '勇闯天涯', unit: '瓶', price: 10, category: '啤酒' },
  { id: '5', name: '雪花纯生', unit: '瓶', price: 18, category: '啤酒' },
  { id: '6', name: '漓泉 1998', unit: '瓶', price: 18, category: '啤酒' },
  { id: '7', name: '漓泉', unit: '瓶', price: 16, category: '啤酒' },
  { id: '8', name: '雪花', unit: '瓶', price: 8, category: '啤酒' },
  { id: '9', name: '百威', unit: '瓶', price: 25, category: '啤酒' },

  // 9-21: Drinks
  { id: '10', name: '冰红茶', unit: '瓶', price: 8, category: '饮料' },
  { id: '11', name: '苏打水', unit: '瓶', price: 6, category: '饮料' },
  { id: '12', name: '矿泉水', unit: '瓶', price: 6, category: '饮料' },
  { id: '13', name: '王老吉', unit: '瓶', price: 10, category: '饮料' },
  { id: '14', name: '苹果醋', unit: '瓶', price: 12, category: '饮料' },
  { id: '15', name: '百事可乐', unit: '瓶', price: 10, category: '饮料' },
  { id: '16', name: '雪碧', unit: '瓶', price: 10, category: '饮料' },
  { id: '17', name: '红牛', unit: '罐', price: 12, category: '饮料' },
  { id: '18', name: '旺仔', unit: '瓶', price: 12, category: '饮料' },
  { id: '19', name: '台椰', unit: '瓶', price: 18, category: '饮料' },
  { id: '20', name: '阿萨姆', unit: '瓶', price: 13, category: '饮料' },
  { id: '21', name: '东鹏', unit: '瓶', price: 10, category: '饮料' },
  { id: '22', name: '津威', unit: '板', price: 25, category: '饮料' },

  // 23-47: Snacks (Packaged)
  { id: '23', name: '土豆片小包', unit: '包', price: 18, category: '零食' },
  { id: '24', name: '土豆丝小包', unit: '包', price: 12, category: '零食' },
  { id: '25', name: '杨梅', unit: '盒', price: 26, category: '零食' },
  { id: '26', name: '半边梅', unit: '盒', price: 26, category: '零食' },
  { id: '27', name: '绿提子', unit: '盒', price: 26, category: '零食' },
  { id: '28', name: '车厘子味李', unit: '盒', price: 26, category: '零食' },
  { id: '29', name: '奶酸梅', unit: '盒', price: 26, category: '零食' },
  { id: '30', name: '益达', unit: '盒', price: 28, category: '零食' },
  { id: '31', name: '黑加仑味李', unit: '盒', price: 26, category: '零食' },
  { id: '32', name: '情人梅', unit: '盒', price: 26, category: '零食' },
  
  // 33: Daily
  { id: '33', name: '扑克牌', unit: '副', price: 10, category: '日用' },

  // 34-47: More Snacks
  { id: '34', name: '情人梅(包)', unit: '包', price: 20, category: '零食' },
  { id: '35', name: '九制杨梅', unit: '包', price: 20, category: '零食' },
  { id: '36', name: '半边梅(包)', unit: '包', price: 20, category: '零食' },
  { id: '37', name: '正宗话梅', unit: '包', price: 25, category: '零食' },
  { id: '38', name: '鸡爪', unit: '包', price: 15, category: '零食' },
  { id: '39', name: '笋尖', unit: '包', price: 13, category: '零食' },
  { id: '40', name: '锅巴', unit: '包', price: 15, category: '零食' },
  { id: '41', name: '蚕豆', unit: '包', price: 15, category: '零食' },
  { id: '42', name: '寻唐记锅巴', unit: '包', price: 18, category: '零食' },
  { id: '43', name: '猫耳朵', unit: '包', price: 16, category: '零食' },
  { id: '44', name: '可比克薯片', unit: '包', price: 16, category: '零食' },
  { id: '45', name: '开心果', unit: '包', price: 20, category: '零食' },
  { id: '46', name: '洽洽瓜子', unit: '包', price: 16, category: '零食' },
  { id: '47', name: '酒鬼花生', unit: '包', price: 15, category: '零食' },
  { id: '48', name: '伊达鱿鱼丝', unit: '包', price: 20, category: '零食' },

  // 49-55: Betel Nut & Tobacco
  { id: '49', name: '和成天下', unit: '包', price: 60, category: '槟榔' },
  { id: '50', name: '口味王', unit: '包', price: 40, category: '槟榔' },
  { id: '51', name: '细硬遵', unit: '包', price: 45, category: '烟草' },
  { id: '52', name: '富贵', unit: '包', price: 60, category: '烟草' },
  { id: '53', name: '软遵义', unit: '包', price: 45, category: '烟草' },
  { id: '54', name: '硬遵义', unit: '包', price: 35, category: '烟草' },
  { id: '55', name: '硬中华', unit: '包', price: 55, category: '烟草' },
  { id: '56', name: '软中华', unit: '包', price: 80, category: '烟草' },

  // 57-72: Bags/Buckets Snacks
  { id: '57', name: '爆米花', unit: '桶', price: 20, category: '零食' },
  // Note: Skipping duplicate Blackcurrant Plum if name identical to ID 31, using unique ID 58 just in case
  { id: '58', name: '素鳗鱼丝味', unit: '袋', price: 20, category: '零食' },
  { id: '59', name: '香辣香酥鱼', unit: '袋', price: 20, category: '零食' },
  { id: '60', name: '虾条', unit: '袋', price: 15, category: '零食' },
  { id: '61', name: '榴莲味软糖', unit: '袋', price: 18, category: '零食' },
  { id: '62', name: '馋嘴小麻花', unit: '袋', price: 18, category: '零食' },
  { id: '63', name: '椒麻酥', unit: '袋', price: 15, category: '零食' },
  { id: '64', name: '蓝莓味李果', unit: '袋', price: 20, category: '零食' },
  { id: '65', name: '阿胶枣', unit: '袋', price: 20, category: '零食' },
  { id: '66', name: '杨梅果干', unit: '袋', price: 20, category: '零食' },
  { id: '67', name: '老婆梅', unit: '袋', price: 20, category: '零食' },
  { id: '68', name: '半梅干', unit: '袋', price: 20, category: '零食' },
  { id: '69', name: '妙酸梅', unit: '袋', price: 20, category: '零食' },
  { id: '70', name: '空心脆', unit: '袋', price: 15, category: '零食' },
  { id: '71', name: '麻辣卷', unit: '袋', price: 20, category: '零食' },
  
  // 73-81: Other Snacks (Manual Additions from bottom list)
  { id: '73', name: '手工素牛排', unit: '袋', price: 0, category: '零食' },
  { id: '74', name: '哈哈辣棒', unit: '袋', price: 0, category: '零食' },
  { id: '75', name: '摩力丝', unit: '袋', price: 0, category: '零食' },
  { id: '76', name: '肥肠酥', unit: '袋', price: 0, category: '零食' },
  { id: '77', name: '多味花生', unit: '袋', price: 0, category: '零食' },
  { id: '78', name: '卤煮花生', unit: '袋', price: 18, category: '零食' },
  { id: '79', name: '我de土豆', unit: '袋', price: 12, category: '零食' },
  { id: '80', name: '盼盼薯片', unit: '袋', price: 18, category: '零食' },
  { id: '81', name: '黄金豆', unit: '袋', price: 15, category: '零食' },
];

const DEFAULT_DATA: AppData = {
  products: DEFAULT_PRODUCTS,
  logs: {},
  operations: []
};

export const loadData = (): AppData => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return DEFAULT_DATA;
    const parsed = JSON.parse(serialized);
    // Migration: ensure operations exists
    if (!parsed.operations) parsed.operations = [];
    return parsed;
  } catch (e) {
    console.error("Failed to load data", e);
    return DEFAULT_DATA;
  }
};

export const saveData = (data: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

export const getFormattedDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const getPreviousDate = (dateString: string): string => {
  const date = new Date(dateString);
  date.setDate(date.getDate() - 1);
  return getFormattedDate(date);
};

export const getTableDataForDate = (data: AppData, dateStr: string): TableRowData[] => {
  const prevDateStr = getPreviousDate(dateStr);
  const todaysLog = data.logs[dateStr] || {};
  const yesterdaysLog = data.logs[prevDateStr] || {};

  return data.products.map(product => {
    let openingStock = 0;
    
    const yLog = yesterdaysLog[product.id];
    if (yLog) {
       const yCalculated = yLog.openingStock + yLog.purchaseIn + yLog.returnIn - yLog.salesOut - yLog.giftOut - yLog.packageGiftOut;
       // If manual check exists for yesterday, it overrides the calculated stock for today's opening
       openingStock = yLog.manualCheck !== undefined && yLog.manualCheck !== null ? yLog.manualCheck : yCalculated;
    }

    const entry: DailyLogEntry = todaysLog[product.id] || {
      productId: product.id,
      openingStock: openingStock, 
      purchaseIn: 0,
      salesOut: 0,
      giftOut: 0,
      returnIn: 0,
      packageGiftOut: 0,
      notes: '',
      manualCheck: undefined
    };

    // Always ensure opening stock is fresh from yesterday logic if not explicitly overridden (though our logic above handles it)
    if (!todaysLog[product.id] && yLog) {
      entry.openingStock = openingStock;
    }

    const calculatedStock = entry.openingStock + entry.purchaseIn + entry.returnIn - entry.salesOut - entry.giftOut - entry.packageGiftOut;
    
    // Discrepancy = Manual - Calculated
    // If Manual > Calculated => Positive (More by X)
    // If Manual < Calculated => Negative (Less by X)
    const discrepancy = (entry.manualCheck !== undefined && entry.manualCheck !== null) 
      ? entry.manualCheck - calculatedStock 
      : 0;

    return {
      ...product,
      ...entry,
      calculatedStock,
      discrepancy
    };
  });
};

export const getTodaysOperations = (data: AppData, dateStr: string): OperationLog[] => {
  // Return logs that match the date string (approximate, since logs store timestamp)
  const startOfDay = new Date(dateStr).getTime();
  // Filter logs where the formatted date matches
  return data.operations
    .filter(op => getFormattedDate(new Date(op.timestamp)) === dateStr)
    .sort((a, b) => b.timestamp - a.timestamp);
};