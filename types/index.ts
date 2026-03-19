/**
 * Represents a single user transaction mapped directly from the SQLite database.
 */
export interface Transaction {
    id: number;
    symbol: string;
    type: 'Buy' | 'Sell';
    exchange: 'NSE' | 'BSE';
    date: string; // YYYY-MM-DD format
    quantity: number;
    price: number; // The executed purchase/sell price per share
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
}
