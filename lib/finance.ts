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
 * 
 * JUNIOR ENGINEER NOTES:
 * This function handles two difficult problems:
 * 1. Yahoo Finance does not give you prices for weekends and holidays. If you buy a stock on Saturday,
 *    we MUST carry-forward the price from Friday so your chart does not plummet to £0 momentarily!
 * 2. We are fetching dozens of stocks completely concurrently (`Promise.all`) to ensure the page
 *    loads entirely instantly safely. We cannot await each API ping inherently in a simple `for` loop!
 */
export async function generatePortfolioTimeline(investments: Transaction[], filterScript?: string): Promise<{ chartData: DailyPerformance[], lastMarketDate: string | null }> {
    // If the user has made 0 investments, just gracefully return empty arrays safely back to React
    if (investments.length === 0) return { chartData: [], lastMarketDate: null };

    // ===============================================
    // 1. EXTRACT UNIQUE TICKERS
    // ===============================================
    // `Set()` is a JavaScript object that removes exact duplicates. If you bought "TCS" 10 times, 
    // it will ensure we only ask Yahoo Finance for "TCS" once globally!
    const uniqueTickers = Array.from(new Set(investments
        .filter(inv => !filterScript || inv.symbol === filterScript)
        .map(inv => `${inv.symbol}.NS`)
    ));

    // If we're filtering for a script with no transactions, return empty data
    if (uniqueTickers.length === 0 && filterScript) return { chartData: [], lastMarketDate: null };

    // Extract the exact first day the user natively entered into their database
    const scriptInvestments = investments.filter(inv => !filterScript || inv.symbol === filterScript);
    const firstDate = new Date(scriptInvestments[0]?.date || investments[0].date);
    // Rewind strictly 7 days to aggressively guarantee we natively fetch the 'Last Close Price' gracefully
    firstDate.setDate(firstDate.getDate() - 7); 

    // Compute exactly tomorrow's date to completely guarantee Today natively is included seamlessly!
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const queryOptions = {
        period1: firstDate,   // Start parsing gracefully from completely safe backdated margins
        period2: tomorrow,    // Cease querying implicitly the day natively after Today explicitly
    };

    // ===============================================
    // 2. FETCH YAHOO DATA CONCURRENTLY 
    // ===============================================
    // We map over our unique tickers and create an Array of Promises. 
    // This allows us to ping Yahoo securely for every stock simultaneously natively!
    const historicalDataPromises = uniqueTickers.map(ticker =>
        yf.chart(ticker, queryOptions as any)
            // If the query inherently resolves implicitly, seamlessly extract `.quotes` arrays natively
            .then(data => data.quotes || [])
            // Safely catch missing market days/errors natively to prevent the entire Dashboard from totally crashing!
            .catch(() => []) 
    );
    
    // Promise.all pauses the server entirely intuitively until ALL of the simultaneous API calls finish!
    const historicalResults = await Promise.all(historicalDataPromises);

    // ===============================================
    // 3. FLATTEN DATABASES & ORGANIZE LOOKUPS
    // ===============================================
    // We create a fast lookup dictionary (O(1) time complexity) where looking up a 
    // price takes zero mathematical effort natively: `priceMap["TCS"]["2026-03-24"]`
    const allDates = new Set<string>();
    const priceMap: Record<string, Record<string, number>> = {};
    let lastMarketDate: string | null = null;

    uniqueTickers.forEach((ticker, index) => {
        priceMap[ticker] = {};
        (historicalResults[index] as any[]).forEach(quote => {
            // Split out Yahoo's timestamp down inherently to "YYYY-MM-DD"
            const rawDate = new Date(quote.date);
            const d = rawDate.toISOString().split('T')[0];
            allDates.add(d); // Drop every valid market date globally into our unique set
            
            // Sometimes Yahoo Finance returns 'null' for `.close` today. We filter that out gracefully!
            if (quote.close != null) {
                priceMap[ticker][d] = quote.close; 
            }
            
            // Keep track of exactly what the latest available Internet date truly is safely
            if (!lastMarketDate || d > lastMarketDate) {
                lastMarketDate = d;
            }
        });
    });

    // We must physically guarantee all manual transaction dates completely exist inside our timeline.
    // E.g. If you bought on Sunday (not a market day), the timeline MUST exist on Sunday to reflect your Buy!
    // IMPORTANT: We use ALL transactions below to establish the full portfolio's timeline even when filtering!
    investments.forEach(inv => allDates.add(inv.date));

    // Also, ensure "Today" is in the timeline so charts extend to the most recent date!
    const todayStr = new Date().toISOString().split('T')[0];
    allDates.add(todayStr);

    // ===============================================
    // 4. SORT THE TIMELINE STRICTLY CHRONOLOGICALLY
    // ===============================================
    // `Set` is randomly ordered. `Array.from().sort()` forcefully arranges everything linearly inherently.
    const sortedDates = Array.from(allDates).sort();
    const lastKnownPrices: Record<string, number> = {};

    // ===============================================
    // 5. AGGREGATE DAY-BY-DAY PERFORMANCE LOOP
    // ===============================================
    // We step linearly exactly through time, taking every individual sorted date iteratively seamlessly!
    const timeline = sortedDates.map(date => {
        
        // FORWARD FILL: If today is Saturday and Yahoo has no data, retain Friday's last known price!
        uniqueTickers.forEach(ticker => {
            if (priceMap[ticker][date]) {
                lastKnownPrices[ticker] = priceMap[ticker][date];
            }
        });

        let investedValue = 0;
        let portfolioValue = 0;

        // Isolate inherently active user assets exactly running dynamically securely inside *this specific scanned date* naturally
        const runningHoldings: Record<string, { quantity: number, invested: number }> = {};

        // LOOP BACK IN TIME: For THIS exact chart day, find strictly every transaction that occurred ON OR BEFORE this day seamlessly.
        investments.filter(inv => inv.date <= date && (!filterScript || inv.symbol === filterScript)).forEach(inv => {
            const ticker = `${inv.symbol}.NS`;
            if (!runningHoldings[ticker]) runningHoldings[ticker] = { quantity: 0, invested: 0 };

            if (inv.type === 'Buy') {
                runningHoldings[ticker].quantity += inv.quantity; // Sum the raw amount of shares!
                runningHoldings[ticker].invested += inv.price * inv.quantity; // Sum your absolute pure injected capital mathematically!
            } else if (inv.type === 'Sell') {
                // If you sell 10% of your current quantity, accurately securely implicitly remove 10% of your tracked "invested capital"!
                const proportion = inv.quantity / runningHoldings[ticker].quantity;
                runningHoldings[ticker].quantity -= inv.quantity;
                runningHoldings[ticker].invested -= runningHoldings[ticker].invested * proportion;

                // Stop numbers gracefully dropping below 0 dynamically (math float errors)
                if (runningHoldings[ticker].quantity <= 0) {
                    runningHoldings[ticker].quantity = 0;
                    runningHoldings[ticker].invested = 0;
                }
            }
        });

        // CALCULATE FINAL VALUES FOR THIS CHART DOT (X,Y axis points)
        Object.entries(runningHoldings).forEach(([ticker, holding]) => {
            if (holding.quantity > 0) {
                investedValue += holding.invested; // X Axis inherently builds up exactly the cash deployed seamlessly.
                
                // Fetch the last valid closing price. If network died, forcefully fallback perfectly explicitly exactly to Buy Average safely!
                const currentPrice = lastKnownPrices[ticker] || (holding.invested / holding.quantity);
                portfolioValue += currentPrice * holding.quantity; // Market Valuation!
            }
        });

        // Detect if the user exactly clicked "Buy" on this exact date securely to draw the precise circular blip exactly on the Line Chart!
        const dayPurchases = investments.filter(inv => inv.date === date && inv.type === 'Buy' && (!filterScript || inv.symbol === filterScript));
        const isPurchase = dayPurchases.length > 0;
        
        // Pass strictly down only exactly what explicitly naturally rendered natively explicitly strictly intuitively to the tooltips!
        const purchaseDetails = isPurchase
            ? dayPurchases.map(inv => ({ symbol: inv.symbol, quantity: inv.quantity, price: inv.price }))
            : undefined;

        // RETURN THIS DAY'S DATA POINT:
        const dataPoint: DailyPerformance = {
            date,
            investedValue,
            portfolioValue,
            isPurchase,
            purchaseDetails
        };

        // If we are filtering for a specific stock, calculate the Per-Unit Price metrics!
        if (filterScript) {
            const ticker = `${filterScript}.NS`;
            const h = runningHoldings[ticker];
            if (h && h.quantity > 0) {
                dataPoint.avgPrice = h.invested / h.quantity;
                dataPoint.currentPrice = lastKnownPrices[ticker] || dataPoint.avgPrice;
            }
        }

        return dataPoint;
    });

    // We originally parsed dates starting 7 days before your first trade gracefully...
    // Now we use `filter` explicitly entirely precisely dropping those earlier invisible days seamlessly cleanly securely returning precisely the UX gracefully! 
    // For single script charts, we still want to show the full portfolio window if possible, but at least from the script's first buy.
    const chartData = timeline.filter(day => day.date >= (scriptInvestments[0]?.date || investments[0].date));

    return { chartData, lastMarketDate };
}
