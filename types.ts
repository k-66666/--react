export interface Product {
  id: string;
  name: string;
  unit: string;
  price: number;
  category?: string;
}

export interface DailyLogEntry {
  productId: string;
  openingStock: number; // Yesterday's closing
  manualOpeningStock?: number; // Priority Override
  
  // IN (+ Stock)
  purchaseIn: number;   // 进货
  returnIn: number;     // 寄存 (Deposit)

  // OUT (- Stock)
  claimOut: number;     // 寄领 (New)
  giftOut: number;      // 赠送
  feedbackOut: number;  // 回馈 (New)
  packageGiftOut: number; // 套餐赠送
  salesOut: number;     // 销售

  // CHECKS
  manualCheck?: number; // 初盘 (Initial Check)
  reCheck?: number;     // 复盘 (Re-Check) (New)
  
  notes: string;
}

export interface DailyLog {
  [productId: string]: DailyLogEntry;
}

export interface OperationLog {
  id: string;
  timestamp: number;
  type: 'STOCK_IN' | 'SALE' | 'GIFT' | 'RETURN' | 'PACKAGE' | 'CLAIM' | 'FEEDBACK' | 'CHECK' | 'RECHECK' | 'MODIFY';
  productName: string;
  detail: string;
  delta?: number;
}

export interface AppData {
  products: Product[];
  logs: Record<string, DailyLog>;
  operations: OperationLog[];
}

export interface TableRowData extends Product, DailyLogEntry {
  calculatedStock: number; 
  discrepancy: number; // calculated - manualCheck
  isManualOpening?: boolean;
}

export enum ViewMode {
  INVENTORY = 'INVENTORY',
  PRODUCTS = 'PRODUCTS',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS',
  HISTORY = 'HISTORY'
}