/**
 * Represents a single user transaction mapped directly from the SQLite database.
 */
export interface Transaction {
    id: number;
    script: string;
    date: string; // YYYY-MM-DD
    qty: number;
    price: number;
    amount: number;
    holding_days?: number;
    tax?: number;
    remark?: string;
    
    // Extrapolated legacy params 
    symbol: string;
    type: string;
    exchange: string;
    quantity: number;
}

/**
 * Represents the aggregated daily performance metrics calculated strictly for the charting algorithm.
 */
export interface DailyPerformance {
    date: string;
    investedValue: number;
    portfolioValue: number;
    isPurchase: boolean;
    purchaseDetails?: Pick<Transaction, 'symbol' | 'quantity' | 'price'>[];
    avgPrice?: number;
    currentPrice?: number;
}
