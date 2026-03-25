import { getDb } from './lib/db';
import { generatePortfolioTimeline } from './lib/finance';

async function main() {
  const db = await getDb();
  const dbTransactions = await db.all('SELECT * FROM transactions ORDER BY date ASC');
  const investments = dbTransactions.map((row: any) => ({
    id: row.id,
    script: row.script,
    date: row.date,
    qty: row.qty,
    price: row.price,
    amount: row.amount,
    symbol: row.script,
    type: 'Buy',
    exchange: 'NSE',
    quantity: row.qty
  }));
  const res = await generatePortfolioTimeline(investments as any);
  
  // Custom tracking logic inside test.ts to mimic finance.ts holding calculation
  const runningHoldings: Record<string, { quantity: number, invested: number }> = {};
  investments.forEach((inv: any) => {
      const ticker = `${inv.symbol}.NS`;
      if (!runningHoldings[ticker]) runningHoldings[ticker] = { quantity: 0, invested: 0 };
      runningHoldings[ticker].quantity += inv.quantity;
      runningHoldings[ticker].invested += inv.price * inv.quantity;
  });

  const YahooFinance = require('yahoo-finance2').default;
  const yf = new YahooFinance();
  let totalPortfolio = 0;
  for (const [ticker, holding] of Object.entries(runningHoldings)) {
      try {
          const data = await yf.quote(ticker);
          const val = data.regularMarketPrice * holding.quantity;
          console.log(`${ticker}: Qty ${holding.quantity} | Avg ${(holding.invested/holding.quantity).toFixed(2)} | Cmp ${data.regularMarketPrice} | Val $${val}`);
          totalPortfolio += val;
      } catch (e) {
          console.log(`${ticker} ERROR`, (e as any).message);
      }
  }
  console.log('Final Exact Portfolio:', totalPortfolio);
}
main().catch(console.error);
