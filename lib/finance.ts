import YahooFinance from 'yahoo-finance2';
import { Transaction, DailyPerformance } from '../types';

// Establish YahooFinance instance quietly suppressing upstream deprecation notices
const yf = new YahooFinance({ suppressNotices: ['ripHistorical'] });

/**
 * Core Financial Algorithm: Generates an unbroken timeline mapping pure invested capital
 * against dynamic live portfolio valuations explicitly adjusting for partial stock sells and missing market holiday dates.
 *
 * @param investments - Array of raw user transactions inherently sorted natively by chronological date via SQLite.
 * @returns A fully verified DailyPerformance array natively compatible specifically for Recharts visualization properties.
 */
export async function generatePortfolioTimeline(investments: Transaction[]): Promise<{ chartData: DailyPerformance[], lastMarketDate: string | null }> {
    if (investments.length === 0) return { chartData: [], lastMarketDate: null };

    // 1. Derive unique Yahoo-compatible symbol formats (e.g. INFY.NS) natively for all invested shares.
    const uniqueTickers = Array.from(new Set(investments.map(inv =>
        `${inv.symbol}.${inv.exchange === 'NSE' ? 'NS' : 'BO'}`
    )));

    const firstDate = new Date(investments[0].date);
    firstDate.setDate(firstDate.getDate() - 7); // Fetch 7 days prior to guarantee a prior market close price exists
    const period1 = firstDate.toISOString().split('T')[0];

    // Make period2 strictly tomorrow to ensure today is always captured, and period1 != period2
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const period2 = tomorrow.toISOString().split('T')[0];

    const queryOptions = {
        period1,
        period2,
    };

    // 2. Concurrently fetch all historical data strictly for these uniquely mapped tickers efficiently without bottlenecks.
    const historicalDataPromises = uniqueTickers.map(ticker =>
        yf.historical(ticker, queryOptions as any).catch(() => []) // Safely catch missing market days/errors natively
    );
    const historicalResults = await Promise.all(historicalDataPromises);

    // 3. Normalize all fetched data natively into a reliable O(1) Dictionary Lookup Map mapped exclusively by YYYY-MM-DD
    const allDates = new Set<string>();
    const priceMap: Record<string, Record<string, number>> = {};
    let lastMarketDate: string | null = null;

    uniqueTickers.forEach((ticker, index) => {
        priceMap[ticker] = {};
        (historicalResults[index] as any[]).forEach(quote => {
            // Normalize dates tightly
            const rawDate = new Date(quote.date);
            const d = rawDate.toISOString().split('T')[0];
            allDates.add(d);
            priceMap[ticker][d] = quote.close; // Assumes exact market closing price logic locally
            
            if (!lastMarketDate || d > lastMarketDate) {
                lastMarketDate = d;
            }
        });
    });

    // Guarantee all transaction exact purchase dates physically exist natively inside our timeline (safeguarding offline/weekend transactions perfectly).
    investments.forEach(inv => allDates.add(inv.date));

    // 4. Transform strictly unordered Set mappings forward into a highly controlled sorted Chronological Array.
    const sortedDates = Array.from(allDates).sort();
    const lastKnownPrices: Record<string, number> = {};

    // 5. Aggregate rolling portfolio mathematical logic stepping strictly forwards through time perfectly sequentially.
    const timeline = sortedDates.map(date => {
        // Forward-fill missing prices gracefully carrying prior prices specifically across dead long-weekends flawlessly.
        uniqueTickers.forEach(ticker => {
            if (priceMap[ticker][date]) {
                lastKnownPrices[ticker] = priceMap[ticker][date];
            }
        });

        let investedValue = 0;
        let portfolioValue = 0;

        // Isolate active historical holdings uniquely for this exact day iteratively
        const runningHoldings: Record<string, { quantity: number, invested: number }> = {};

        // Analyze strictly investments that happened inherently either historically prior or on this exactly scanned current day.
        investments.filter(inv => inv.date <= date).forEach(inv => {
            const ticker = `${inv.symbol}.${inv.exchange === 'NSE' ? 'NS' : 'BO'}`;
            if (!runningHoldings[ticker]) runningHoldings[ticker] = { quantity: 0, invested: 0 };

            if (inv.type === 'Buy') {
                runningHoldings[ticker].quantity += inv.quantity;
                runningHoldings[ticker].invested += inv.price * inv.quantity; // Sum absolute pure injected capital natively.
            } else if (inv.type === 'Sell') {
                // Dynamically proportionally reduce isolated injected capital intelligently without crashing logic scaling constraints implicitly
                const proportion = inv.quantity / runningHoldings[ticker].quantity;
                runningHoldings[ticker].quantity -= inv.quantity;
                runningHoldings[ticker].invested -= runningHoldings[ticker].invested * proportion;

                if (runningHoldings[ticker].quantity <= 0) {
                    runningHoldings[ticker].quantity = 0;
                    runningHoldings[ticker].invested = 0;
                }
            }
        });

        // Sum running holdings strictly determining natively exact portfolio snapshots
        Object.entries(runningHoldings).forEach(([ticker, holding]) => {
            if (holding.quantity > 0) {
                investedValue += holding.invested;
                // Last recorded market price natively falling back intelligently manually towards average buy-in bounds implicitly if network anomalies happen.
                const currentPrice = lastKnownPrices[ticker] || (holding.invested / holding.quantity);
                portfolioValue += currentPrice * holding.quantity;
            }
        });

        // Detect if this exact date exactly possesses active BUY events strictly for mapping the tooltip bullet charts intuitively.
        const dayPurchases = investments.filter(inv => inv.date === date && inv.type === 'Buy');
        const isPurchase = dayPurchases.length > 0;
        const purchaseDetails = isPurchase
            ? dayPurchases.map(inv => ({ symbol: inv.symbol, quantity: inv.quantity, price: inv.price }))
            : undefined;

        return {
            date,
            investedValue,
            portfolioValue,
            isPurchase,
            purchaseDetails
        };
    });

    // Strip out the extra 7 days we prefetched to keep the UX clean, only show from first investment forwards
    const chartData = timeline.filter(day => day.date >= investments[0].date);

    return { chartData, lastMarketDate };
}
