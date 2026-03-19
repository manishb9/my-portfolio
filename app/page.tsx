import StockChart from './StockChart';
import YahooFinance from 'yahoo-finance2';
import { getDb } from '../lib/db';
import TransactionForm from './TransactionForm';
import TransactionTable from './TransactionTable';

const yahooFinance = new YahooFinance({ suppressNotices: ['ripHistorical'] });

export default async function Home() {
  const db = await getDb();
  const dbTransactions = await db.all('SELECT * FROM transactions ORDER BY date ASC');

  // Transform DB rows to the typed object
  const investments = dbTransactions.map(row => ({
    id: row.id,
    symbol: row.symbol,
    type: row.type,
    exchange: row.exchange,
    date: row.date,
    quantity: row.quantity,
    buyPrice: row.price // generalized "price" field whether buy or sell
  }));

  // Derive unique tickers
  const uniqueTickers = Array.from(new Set(investments.map(inv => `${inv.symbol}.${inv.exchange === 'NSE' ? 'NS' : 'BO'}`)));

  const today = new Date().toISOString().split('T')[0];
  const queryOptions = {
    period1: investments.length > 0 ? investments[0].date : today,
    period2: today,
  };

  let historicalResults: any[] = [];
  if (uniqueTickers.length > 0) {
    // Only fetch if there are tickers
    const historicalDataPromises = uniqueTickers.map(ticker => yahooFinance.historical(ticker, queryOptions as any));
    historicalResults = await Promise.all(historicalDataPromises);
  }

  const allDates = new Set<string>();
  const priceMap: Record<string, Record<string, number>> = {};

  uniqueTickers.forEach((ticker, index) => {
    priceMap[ticker] = {};
    (historicalResults[index] as any[]).forEach(quote => {
      const d = new Date(quote.date).toISOString().split('T')[0];
      allDates.add(d);
      priceMap[ticker][d] = quote.close;
    });
  });

  investments.forEach(inv => allDates.add(inv.date));

  const sortedDates = Array.from(allDates).sort();
  let lastKnownPrices: Record<string, number> = {};

  const chartData = sortedDates.map(date => {
    uniqueTickers.forEach(ticker => {
      if (priceMap[ticker][date]) {
        lastKnownPrices[ticker] = priceMap[ticker][date];
      }
    });

    let investedValue = 0;
    let portfolioValue = 0;

    // Track active holdings for this exact date
    const runningHoldings: Record<string, { quantity: number, invested: number }> = {};

    investments.filter(inv => inv.date <= date).forEach(inv => {
      const ticker = `${inv.symbol}.${inv.exchange === 'NSE' ? 'NS' : 'BO'}`;
      if (!runningHoldings[ticker]) runningHoldings[ticker] = { quantity: 0, invested: 0 };

      if (inv.type === 'Buy') {
        runningHoldings[ticker].quantity += inv.quantity;
        runningHoldings[ticker].invested += inv.buyPrice * inv.quantity;
      } else if (inv.type === 'Sell') {
        const proportion = inv.quantity / runningHoldings[ticker].quantity;
        runningHoldings[ticker].quantity -= inv.quantity;
        runningHoldings[ticker].invested -= runningHoldings[ticker].invested * proportion;
        if (runningHoldings[ticker].quantity <= 0) {
          runningHoldings[ticker].quantity = 0;
          runningHoldings[ticker].invested = 0;
        }
      }
    });

    Object.entries(runningHoldings).forEach(([ticker, holding]) => {
      if (holding.quantity > 0) {
        investedValue += holding.invested;
        // fallback to buyPrice or average buy price is hard because last price may not exist yet if bought on holiday
        const currentPrice = lastKnownPrices[ticker] || (holding.invested / holding.quantity);
        portfolioValue += currentPrice * holding.quantity;
      }
    });

    const dayPurchases = investments.filter(inv => inv.date === date && inv.type === 'Buy');
    const isPurchase = dayPurchases.length > 0;
    const purchaseDetails = isPurchase
      ? dayPurchases.map(inv => ({ symbol: inv.symbol, quantity: inv.quantity, buyPrice: inv.buyPrice }))
      : undefined;

    return {
      date,
      investedValue,
      portfolioValue,
      isPurchase,
      purchaseDetails
    };
  });

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>My Portfolio Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Track your investments historically
      </p>

      {/* Transaction Entry Form Row */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#111827' }}>Add New Transaction</h2>
      <TransactionForm />

      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#111827' }}>Performance Chart</h2>
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
        <StockChart data={chartData} />
      </div>

      <h2 style={{ fontSize: '1.2rem', marginTop: '3rem', marginBottom: '-1rem', color: '#111827' }}>Transaction History</h2>
      {/* Table to display edit and delete features */}
      <TransactionTable transactions={dbTransactions} />
    </main>
  );
}
