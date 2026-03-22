import StockChart from './StockChart';
import { getDb } from '../lib/db';
import { generatePortfolioTimeline } from '../lib/finance';
import { Transaction } from '../types';
import TransactionForm from './TransactionForm';
import TransactionTable from './TransactionTable';

/**
 * Main Server Component - Next.js Entrypoint
 * 
 * This component fetches raw data entirely on the server natively without 
 * REST API overhead, computes the dynamic portfolio tracking timeline algorithms, 
 * and passes the mathematically resolved static data directly to client components.
 */
export default async function Home() {
  // 1. Establish SQLite DB connection securely
  const db = await getDb();

  // 2. Fetch raw transaction rows natively, implicitly ordered chronologically
  const dbTransactions = await db.all('SELECT * FROM transactions ORDER BY date ASC');

  // 3. Cast the raw dynamic SQLite rows to our strictly validated Typescript abstraction
  const investments: Transaction[] = dbTransactions.map(row => ({
    id: row.id,
    symbol: row.symbol,
    type: row.type,
    exchange: row.exchange,
    date: row.date,
    quantity: row.quantity,
    price: row.price
  }));

  // 4. Compute daily charting metrics utilizing extracted secure finance computations
  const { chartData, lastMarketDate } = await generatePortfolioTimeline(investments);

  // 5. Render Server-Side User Interface seamlessly
  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>My Portfolio Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Track your investments historically natively in Next.js
      </p>

      {/* Entry Interface: Intercepts raw Trade data seamlessly mapping downstream safely */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#111827' }}>Add New Transaction</h2>
      <TransactionForm />

      {/* Visualization Canvas: Renders strictly computed data seamlessly mathematically */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#111827' }}>Performance Chart</h2>
        {lastMarketDate && (
          <span style={{ fontSize: '0.9rem', color: '#666' }}>Data till {lastMarketDate}</span>
        )}
      </div>
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}>
        <StockChart data={chartData} />
      </div>

      {/* Structural Data Editor: Grid representation mapping seamless SQLite CRUD interactions */}
      <h2 style={{ fontSize: '1.2rem', marginTop: '3rem', marginBottom: '-1rem', color: '#111827' }}>Transaction History</h2>
      <TransactionTable transactions={dbTransactions} />
    </main>
  );
}
