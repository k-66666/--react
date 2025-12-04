import { AppData, Product, DailyLogEntry, TableRowData, OperationLog } from '../types';

const STORAGE_KEY = 'smart_stock_master_v1';

// Full product list based on user image data (107 items)
const DEFAULT_PRODUCTS: Product[] = [
  // 1-9: Alcohol / Wine
  { id: '1', name: '赛伊港酿红', unit: '瓶', price: 0, category: '酒水' },
  { id: '4', name: '玫瑰气泡酒', unit: '瓶', price: 0, category: '酒水' },
  { id: '9', name: '特级赤夏珠', unit: '瓶', price: 0, category: '酒水' },
  
  // 10-14: Beer
  { id: '10', name: '勇闯天涯', unit: '瓶', price: 55, category: '啤酒' }, 
  { id: '11', name: '雪花纯生', unit: '瓶', price: 18, category: '啤酒' },
  { id: '12', name: '漓泉 1998', unit: '瓶', price: 18, category: '啤酒' },
  { id: '13', name: '漓泉', unit: '瓶', price: 16, category: '啤酒' },
  { id: '14', name: '雪花', unit: '瓶', price: 8, category: '啤酒' },

  // 15-30: Drinks
  { id: '15', name: '冰红茶', unit: '瓶', price: 8, category: '饮料' },
  { id: '16', name: '苏打水', unit: '瓶', price: 6, category: '饮料' },
  { id: '17', name: '矿泉水', unit: '瓶', price: 6, category: '饮料' },
  { id: '18', name: '王老吉', unit: '瓶', price: 10, category: '饮料' },
  { id: '19', name: '苹果醋', unit: '瓶', price: 12, category: '饮料' },
  { id: '20', name: '百事可乐', unit: '瓶', price: 10, category: '饮料' },
  { id: '21', name: '雪碧', unit: '瓶', price: 10, category: '饮料' },
  { id: '22', name: '红牛', unit: '罐', price: 12, category: '饮料' },
  { id: '23', name: '旺仔', unit: '瓶', price: 12, category: '饮料' },
  { id: '24', name: '台椰', unit: '瓶', price: 18, category: '饮料' },
  { id: '27', name: '阿萨姆', unit: '瓶', price: 13, category: '饮料' },
  { id: '29', name: '东鹏', unit: '瓶', price: 10, category: '饮料' },
  { id: '30', name: '津威', unit: '板', price: 25, category: '饮料' },

  // 33-47: Snacks
  { id: '33', name: '土豆片小包', unit: '包', price: 18, category: '零食' },
  { id: '34', name: '土豆丝小包', unit: '包', price: 12, category: '零食' },
  { id: '35', name: '杨梅', unit: '盒', price: 26, category: '零食' },
  { id: '36', name: '半边梅', unit: '盒', price: 26, category: '零食' },
  { id: '37', name: '绿提子', unit: '盒', price: 26, category: '零食' },
  { id: '38', name: '车厘子味李', unit: '盒', price: 26, category: '零食' },
  { id: '39', name: '奶酸梅', unit: '盒', price: 26, category: '零食' },
  { id: '40', name: '益达', unit: '盒', price: 28, category: '零食' },
  { id: '41', name: '黑加仑味李', unit: '盒', price: 26, category: '零食' },
  { id: '42', name: '情人梅', unit: '盒', price: 26, category: '零食' },
  
  // 43: Daily
  { id: '43', name: '扑克牌', unit: '副', price: 10, category: '日用' },

  // 44-58: More Snacks
  { id: '44', name: '情人梅(包)', unit: '包', price: 20, category: '零食' },
  { id: '45', name: '九制杨梅', unit: '包', price: 20, category: '零食' },
  { id: '46', name: '半边梅(包)', unit: '包', price: 20, category: '零食' },
  { id: '47', name: '正宗话梅', unit: '包', price: 25, category: '零食' },
  { id: '48', name: '鸡爪', unit: '包', price: 15, category: '零食' },
  { id: '49', name: '笋尖', unit: '包', price: 13, category: '零食' },
  { id: '50', name: '锅巴', unit: '包', price: 15, category: '零食' },
  { id: '51', name: '蚕豆', unit: '包', price: 15, category: '零食' },
  { id: '52', name: '寻唐记锅巴', unit: '包', price: 18, category: '零食' },
  { id: '53', name: '猫耳朵', unit: '包', price: 16, category: '零食' },
  { id: '54', name: '可比克薯片', unit: '包', price: 16, category: '零食' },
  { id: '55', name: '开心果', unit: '包', price: 20, category: '零食' },
  { id: '56', name: '洽洽瓜子', unit: '包', price: 16, category: '零食' },
  { id: '57', name: '酒鬼花生', unit: '包', price: 15, category: '零食' },
  { id: '58', name: '伊达鱿鱼丝', unit: '包', price: 20, category: '零食' },

  // 59-66: Betel Nut & Tobacco
  { id: '59', name: '和成天下', unit: '包', price: 60, category: '槟榔' },
  { id: '60', name: '口味王', unit: '包', price: 40, category: '槟榔' },
  { id: '61', name: '细硬遵', unit: '包', price: 45, category: '烟草' },
  { id: '62', name: '富贵', unit: '包', price: 60, category: '烟草' },
  { id: '63', name: '软遵义', unit: '包', price: 45, category: '烟草' },
  { id: '64', name: '硬遵义', unit: '包', price: 35, category: '烟草' },
  { id: '65', name: '硬中华', unit: '包', price: 55, category: '烟草' },
  { id: '66', name: '软中华', unit: '包', price: 80, category: '烟草' },

  // 82: Beer (Budweiser)
  { id: '82', name: '百威', unit: '瓶', price: 25, category: '啤酒' },

  // 83-107: Extended Snacks List
  { id: '83', name: '爆米花', unit: '桶', price: 20, category: '零食' },
  { id: '84', name: '黑加仑味李(袋)', unit: '袋', price: 26, category: '零食' },
  { id: '85', name: '素鳗鱼丝味', unit: '袋', price: 20, category: '零食' },
  { id: '86', name: '香辣香酥鱼', unit: '袋', price: 20, category: '零食' },
  { id: '87', name: '虾条', unit: '袋', price: 15, category: '零食' },
  { id: '88', name: '榴莲味软糖', unit: '袋', price: 18, category: '零食' },
  { id: '89', name: '馋嘴小麻花', unit: '袋', price: 18, category: '零食' },
  { id: '90', name: '椒麻酥', unit: '袋', price: 15, category: '零食' },
  { id: '91', name: '蓝莓味李果', unit: '袋', price: 20, category: '零食' },
  { id: '92', name: '阿胶枣', unit: '袋', price: 20, category: '零食' },
  { id: '93', name: '杨梅果干', unit: '袋', price: 20, category: '零食' },
  { id: '94', name: '老婆梅', unit: '袋', price: 20, category: '零食' },
  { id: '95', name: '半梅干', unit: '袋', price: 20, category: '零食' },
  { id: '96', name: '妙酸梅', unit: '袋', price: 20, category: '零食' },
  { id: '97', name: '空心脆', unit: '袋', price: 15, category: '零食' },
  { id: '98', name: '麻辣卷', unit: '袋', price: 20, category: '零食' },
  
  { id: '99', name: '手工素牛排', unit: '袋', price: 0, category: '零食' },
  { id: '100', name: '哈哈辣棒', unit: '袋', price: 0, category: '零食' },
  { id: '101', name: '摩力丝', unit: '袋', price: 0, category: '零食' },
  { id: '102', name: '肥肠酥', unit: '袋', price: 0, category: '零食' },
  { id: '103', name: '多味花生', unit: '袋', price: 0, category: '零食' },
  { id: '104', name: '卤煮花生', unit: '袋', price: 18, category: '零食' },
  { id: '105', name: '我de土豆', unit: '袋', price: 12, category: '零食' },
  { id: '106', name: '盼盼薯片', unit: '袋', price: 18, category: '零食' },
  { id: '107', name: '黄金豆', unit: '袋', price: 15, category: '零食' },
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
    if (!parsed.operations) parsed.operations = [];
    // Ensure product list is up to date with defaults if missing
    if (!parsed.products || parsed.products.length < DEFAULT_PRODUCTS.length) {
       // Merge defaults but preserve existing IDs/changes if possible
       DEFAULT_PRODUCTS.forEach(def => {
          if (!parsed.products.find((p: Product) => p.id === def.id)) {
             parsed.products.push(def);
          }
       });
    }
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

// Helper: Find the most recent closing stock from history (skipping empty days)
export const getLastClosingStock = (data: AppData, productId: string, beforeDate: string): number => {
  // Get all dates that have logs, sorted descending
  const dates = Object.keys(data.logs).filter(d => d < beforeDate).sort().reverse();
  
  for (const date of dates) {
    const log = data.logs[date][productId];
    if (log) {
      // Determine what the opening stock was for this day
      // Priority: Manual Override > Stored Opening
      const effectiveOpening = (log.manualOpeningStock !== undefined && log.manualOpeningStock !== null)
          ? Number(log.manualOpeningStock)
          : Number(log.openingStock);

      // Calculate closing stock for that day
      // Closing = Opening + Purchase + Return - Sales - Gift - Package
      const closing = effectiveOpening + Number(log.purchaseIn) + Number(log.returnIn) 
                    - Number(log.salesOut) - Number(log.giftOut) - Number(log.packageGiftOut);
      
      // If there was a manual check that day, it overrides the calculated closing
      // (This serves as the starting point for the next day)
      if (log.manualCheck !== undefined && log.manualCheck !== null) {
        return Number(log.manualCheck);
      }
      return closing;
    }
  }
  
  // If no history found, return 0
  return 0;
};

export const getTableDataForDate = (data: AppData, dateStr: string): TableRowData[] => {
  const todaysLog = data.logs[dateStr] || {};

  return data.products.map(product => {
    let openingStock = 0;
    let isManualOpening = false;
    
    // Logic:
    // 1. If we have an EXPLICIT manual opening stock for today (user set it), use it.
    // 2. Else, if we have a standard log, use it (but check if it was manual).
    // 3. Else, inherit from history.
    
    const productLog = todaysLog[product.id];

    if (productLog && productLog.manualOpeningStock !== undefined && productLog.manualOpeningStock !== null) {
        // High priority: User manually set the opening stock for today
        openingStock = Number(productLog.manualOpeningStock);
        isManualOpening = true;
    } else if (productLog && productLog.openingStock !== undefined) {
        // Standard log exists
        openingStock = Number(productLog.openingStock);
    } else {
        // No log for today, calculate from history
        openingStock = getLastClosingStock(data, product.id, dateStr);
    }

    const entry: DailyLogEntry = productLog || {
      productId: product.id,
      openingStock: openingStock,
      purchaseIn: 0,
      salesOut: 0,
      giftOut: 0,
      returnIn: 0, // Deposit
      packageGiftOut: 0,
      notes: '',
      manualCheck: undefined
    };
    
    // Strict Number casting
    const o = openingStock;
    const p = Number(entry.purchaseIn);
    const r = Number(entry.returnIn); // Deposit (Positive)
    const s = Number(entry.salesOut);
    const g = Number(entry.giftOut);
    const pg = Number(entry.packageGiftOut);

    // FORMULA: Opening + Purchase + Deposit - Sales - Gift - Package
    const calculatedStock = o + p + r - s - g - pg;
    
    // Discrepancy = Manual - Calculated
    const discrepancy = (entry.manualCheck !== undefined && entry.manualCheck !== null) 
      ? Number(entry.manualCheck) - calculatedStock 
      : 0;

    return {
      ...product,
      ...entry,
      openingStock: o, 
      calculatedStock,
      discrepancy,
      isManualOpening
    };
  });
};

export const getTodaysOperations = (data: AppData, dateStr: string): OperationLog[] => {
  return data.operations
    .filter(op => getFormattedDate(new Date(op.timestamp)) === dateStr)
    .sort((a, b) => b.timestamp - a.timestamp);
};