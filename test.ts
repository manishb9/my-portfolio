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
  if (res.chartData.length > 0) {
      console.log('Last 5 Days generated:');
      res.chartData.slice(-5).forEach((d: any) => {
          console.log(`Day: ${d.date} | Inv: ${d.investedValue.toFixed(2)} | Port: ${d.portfolioValue.toFixed(2)}`);
      });
  } else {
      console.log("No chart data.");
  }
}
main().catch(console.error);
