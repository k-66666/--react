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
  purchaseIn: number;   // Today's purchase
  salesOut: number;     // Sales
  giftOut: number;      // Gifts given
  returnIn: number;     // Customer returns
  packageGiftOut: number; // Package gifts
  notes: string;
  manualCheck?: number; // Physical count if different
}

export interface DailyLog {
  [productId: string]: DailyLogEntry;
}

export interface OperationLog {
  id: string;
  timestamp: number;
  type: 'STOCK_IN' | 'SALE' | 'GIFT' | 'RETURN' | 'PACKAGE' | 'CHECK' | 'MODIFY';
  productName: string;
  detail: string;
  delta?: number; // The amount changed (e.g., +5, -2)
}

// Map: "YYYY-MM-DD" -> DailyLog
export interface AppData {
  products: Product[];
  logs: Record<string, DailyLog>;
  operations: OperationLog[]; // New: Audit trail
}

export interface TableRowData extends Product, DailyLogEntry {
  calculatedStock: number; // opening + purchase + return - sales - gift - packageGift
  discrepancy: number; // calculated - manualCheck (if manualCheck exists)
}

export enum ViewMode {
  INVENTORY = 'INVENTORY',
  PRODUCTS = 'PRODUCTS',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS',
  HISTORY = 'HISTORY' // New view
}