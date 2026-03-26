import StockChart from './StockChart';
import { getDb } from '../lib/db';
import { generatePortfolioTimeline } from '../lib/finance';
import { Transaction } from '../types';
import TransactionForm from './TransactionForm';
import TransactionTable from './TransactionTable';
import HoldingsTable from './HoldingsTable';

/**
 * Main Server Component - Next.js Entrypoint
 * 
 * In Next.js (App Router), any component inside the `app` folder (like this one)
 * is a "Server Component" by default. This means it NEVER sends its JavaScript 
 * to the user's browser. It just generates plain HTML on the server.
 * 
 * Because it's on the server, we can securely talk to our Database directly here 
 * without needing to create API routes like `/api/getTransactions`.
 */
export const dynamic = 'force-dynamic'; // Tells Next.js to ALWAYS run this file fresh on every page load (no caching)
export const fetchCache = 'force-no-store'; // Tells Next.js NOT to cache external API fetches (like Yahoo Finance)

export default async function Home() {
  // ==========================================
  // 1. FETCH DATA FROM DATABASE
  // ==========================================
  // We call our internal SQLite database helper to get the active connection
  const db = await getDb();

  // We write an SQL query to get every row from the `transactions` table.
  // ORDER BY date ASC ensures we get them in chronological order (oldest first).
  const dbTransactions = await db.all('SELECT * FROM transactions ORDER BY date ASC');

  // ==========================================
  // 2. FORMAT DATA FOR OUR APP
  // ==========================================
  // `dbTransactions` contains raw database rows. We use `.map()` to loop over 
  // every row and convert it into a strictly typed TypeScript object (`Transaction`).
  const investments: Transaction[] = dbTransactions.map(row => ({
    id: row.id,
    script: row.script,
    date: row.date,
    qty: row.qty,
    price: row.price,
    amount: row.amount,
    holding_days: row.holding_days,
    tax: row.tax,
    remark: row.remark,
    
    // We also set some "legacy" names that our charting library expects
    symbol: row.script,
    type: 'Buy',
    exchange: 'NSE',
    quantity: row.qty
  }));

  // ==========================================
  // 3. GENERATE CHART DATA
  // ==========================================
  // We pass our formatted `investments` to our finance algorithm.
  // Input: An array of our raw trades (e.g., [{ symbol: 'TCS', date: '2022-01-01', ... }])
  // Output: { chartData: [...] } which proves day-by-day performance of the portfolio.
  const { chartData, lastMarketDate } = await generatePortfolioTimeline(investments);


  // ==========================================
  // 4. CALCULATE LIVE HOLDINGS FOR TABLE
  // ==========================================
  // This logic groups all our separate trades by their stock symbol and calculates 
  // how many total shares we have and how much money we invested in them.

  // .reduce() loops over the `investments` array and builds a single object (`acc`) tracking each stock.
  const groupedHoldingsMap = investments.reduce((acc: any, inv: any) => {
      const sym = inv.symbol;
      
      // If we haven't seen this stock before, initialize it in our tracker object
      if (!acc[sym]) {
          acc[sym] = { symbol: sym, quantity: 0, invested: 0 };
      }
      
      // If the trade is a 'Buy', we add to our total quantity and invested money
      if (inv.type === 'Buy') {
          acc[sym].quantity += inv.quantity;
          acc[sym].invested += inv.price * inv.quantity;
      } 
      // If the trade is a 'Sell', we reduce our total quantity and proportionally reduce the invested money
      else if (inv.type === 'Sell' && acc[sym].quantity > 0) {
          const prop = inv.quantity / acc[sym].quantity;
          acc[sym].quantity -= inv.quantity;
          acc[sym].invested -= acc[sym].invested * prop;
      }
      return acc;
  }, {});

  // Convert our grouped object back into an array using Object.values(), then filter 
  // out any stocks we sold completely (quantity > 0).
  const currentHoldingsArray = Object.values(groupedHoldingsMap).filter((h: any) => h.quantity > 0);

  // Now we use `Promise.all` with `.map()` because we need to pause and securely fetch 
  // the live Internet price for EVERY stock asynchronously using Yahoo Finance.
  const holdingsDataForTable = await Promise.all(
      currentHoldingsArray.map(async (h: any) => {
          // Default to exactly what we paid if the internet fails
          let currentPrice = h.invested / h.quantity; 

          try {
              // Import the yahoo-finance package and fetch the real-time quote natively!
              const yf = require('yahoo-finance2').default;
              const yfInstance = new yf({ suppressNotices: ['ripHistorical', 'yahooSurvey'] });
              
              // We append ".NS" because the Indian National Stock Exchange requires that suffix dynamically!
              const quote = await yfInstance.quote(`${h.symbol}.NS`);
              
              if (quote && quote.regularMarketPrice) {
                  currentPrice = quote.regularMarketPrice; // Overwrite our default with the true live price
              }
          } catch(e) {
              console.log("Failed to fetch live price for", h.symbol);
          }
          
          return {
              ...h, 
              avgPrice: h.invested / h.quantity, // Average price paid per share
              currentPrice: currentPrice, // The modern live price
              currentValue: currentPrice * h.quantity // Total worth today!
          }
      })
  );


  // ==========================================
  // 5. RENDER THE HTML (JSX)
  // ==========================================
  // React uses "JSX" so you can write HTML directly inside JavaScript functions!
  // Any variable evaluated inside curly brackets {...} is evaluated dynamically.
  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>My Portfolio Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Track your investments historically natively in Next.js
      </p>

      {/* 
        This is a "Client Component". We pass no 'props' (arguments) to it. 
        It renders the interactive input form natively on the browser.
      */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#111827' }}>Add New Transaction</h2>
      <TransactionForm />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#111827' }}>Performance Chart</h2>
        
        {/* If lastMarketDate exists natively, we display it securely */}
        {lastMarketDate && (
          <span style={{ fontSize: '0.9rem', color: '#666' }}>Data till {lastMarketDate}</span>
        )}
      </div>

      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
        {/* We pass our `chartData` array exactly straight to the custom <StockChart /> component! */}
        <StockChart data={chartData} />
      </div>

      <h2 style={{ fontSize: '1.2rem', marginTop: '3rem', marginBottom: '-1rem', color: '#111827' }}>Current Holdings Snapshot</h2>
      {/* 
        We pass the `holdingsDataForTable` completely resolved live market values 
        directly into the Holdings table props securely!
      */}
      <HoldingsTable holdings={holdingsDataForTable} />

      <h2 style={{ fontSize: '1.2rem', marginTop: '3rem', marginBottom: '-1rem', color: '#111827' }}>Transaction History</h2>
      {/* 
        This renders the basic raw list of Trades!
      */}
      <TransactionTable transactions={investments} />
    </main>
  );
}
