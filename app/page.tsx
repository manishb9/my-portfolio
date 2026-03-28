import StockChart from './StockChart';
import { getDb } from '../lib/db';
import { generatePortfolioTimeline } from '../lib/finance';
import { Transaction } from '../types';
import TransactionForm from './TransactionForm';
import Link from 'next/link';
import ScriptChartSection from './ScriptChartSection';
import PriceVsAvgSection from './PriceVsAvgSection';

/**
 * Main Server Component - Next.js Entrypoint
 */
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function Home() {
  // 1. Establish SQLite DB connection securely
  const db = await getDb();

  // 2. Fetch raw transaction rows natively, implicitly ordered chronologically
  const dbTransactions = await db.all('SELECT * FROM transactions ORDER BY date ASC');

  // 3. Format raw SQL objects to TS Interfaces
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
    
    // Map to legacy params used dynamically across components
    symbol: row.script,
    type: 'Buy',
    exchange: 'NSE',
    quantity: row.qty
  }));

  // 4. Compute daily charting metrics using our finance algorithm
  const { chartData, lastMarketDate } = await generatePortfolioTimeline(investments);

  // 5. Extract unique script symbols for the breakdown chart
  const uniqueSymbols = Array.from(new Set(investments.map(inv => inv.symbol))).sort();

  return (
    <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', backgroundColor: '#f3f4f6', minHeight: '100vh', boxShadow: '0 0 20px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0' }}>Portfolio Tracker</h1>
        <Link 
            href="/history" 
            style={{ 
                background: '#111827', color: '#fff', padding: '10px 20px', 
                borderRadius: '8px', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' 
            }}
        >
            View Portfolio Details &rarr;
        </Link>
      </div>

      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Track your investments historically natively in Next.js
      </p>

      {/* Input Section */}
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#111827' }}>Add New Transaction</h2>
        <TransactionForm />
      </div>

      {/* Chart Visualization Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#111827' }}>Performance Chart</h2>
        {lastMarketDate && (
          <span style={{ fontSize: '0.9rem', color: '#666' }}>Last Data Point: {lastMarketDate}</span>
        )}
      </div>

      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', border: '1px solid #e5e7eb' }}>
        {chartData.length > 0 && (
          <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase' }}>Total Invested</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>₹{chartData[chartData.length - 1].investedValue.toLocaleString()}</p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase' }}>Portfolio Value</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: (chartData[chartData.length - 1].portfolioValue >= chartData[chartData.length - 1].investedValue ? '#10b981' : '#ef4444') }}>₹{chartData[chartData.length - 1].portfolioValue.toLocaleString()}</p>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase' }}>Net Unrealized P&L</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: (chartData[chartData.length - 1].portfolioValue >= chartData[chartData.length - 1].investedValue ? '#10b981' : '#ef4444') }}>
                    {chartData[chartData.length - 1].portfolioValue >= chartData[chartData.length - 1].investedValue ? '+' : ''}
                    {((chartData[chartData.length - 1].portfolioValue - chartData[chartData.length - 1].investedValue) / chartData[chartData.length - 1].investedValue * 100).toFixed(2)}%
                </p>
            </div>
          </div>
        )}
        <StockChart data={chartData} />
      </div>

      {/* Script Specific Analysis Section */}
      <ScriptChartSection symbols={uniqueSymbols} />

      {/* NEW: Price vs Average Analysis Section */}
      <PriceVsAvgSection symbols={uniqueSymbols} />
    </main>
  );
}
