import { getDb } from '../../lib/db';
import { Transaction } from '../../types';
import Link from 'next/link';
import DetailsTabs from '../DetailsTabs';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

/**
 * Details & History Page - Next.js Server Component
 * 
 * This page contains both the current holdings snapshot and the full transaction
 * history, managed via a tabbed interface.
 */
export default async function HistoryPage() {
    // 1. Establish SQLite DB connection securely
    const db = await getDb();

    // 2. Fetch raw transaction rows natively
    const dbTransactions = await db.all('SELECT * FROM transactions ORDER BY date ASC');

    // 3. Format pure JS raw sql objects elegantly into TS interfaces
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

    // ==========================================
    // 4. CALCULATE LIVE HOLDINGS (Duplicated from Home for standalone page)
    // ==========================================
    const groupedHoldingsMap = investments.reduce((acc: any, inv: any) => {
        const sym = inv.symbol;
        if (!acc[sym]) {
            acc[sym] = { symbol: sym, quantity: 0, invested: 0 };
        }
        if (inv.type === 'Buy') {
            acc[sym].quantity += inv.quantity;
            acc[sym].invested += inv.price * inv.quantity;
        } 
        else if (inv.type === 'Sell' && acc[sym].quantity > 0) {
            const prop = inv.quantity / acc[sym].quantity;
            acc[sym].quantity -= inv.quantity;
            acc[sym].invested -= acc[sym].invested * prop;
        }
        return acc;
    }, {});

    const currentHoldingsArray = Object.values(groupedHoldingsMap).filter((h: any) => h.quantity > 0);

    const holdingsDataForTable = await Promise.all(
        currentHoldingsArray.map(async (h: any) => {
            let currentPrice = h.invested / h.quantity; 
            try {
                const yf = require('yahoo-finance2').default;
                const yfInstance = new yf({ suppressNotices: ['ripHistorical', 'yahooSurvey'] });
                const quote = await yfInstance.quote(`${h.symbol}.NS`);
                if (quote && quote.regularMarketPrice) {
                    currentPrice = quote.regularMarketPrice;
                }
            } catch(e) {
                console.log("Failed to fetch live price for", h.symbol);
            }
            return {
                ...h, 
                avgPrice: h.invested / h.quantity,
                currentPrice: currentPrice,
                currentValue: currentPrice * h.quantity
            }
        })
    );

    return (
        <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem', backgroundColor: '#f3f4f6', minHeight: '100vh', boxShadow: '0 0 20px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Portfolio Details</h1>
                <Link 
                    href="/" 
                    style={{ 
                        background: '#e5e7eb', color: '#374151', padding: '8px 16px', 
                        borderRadius: '6px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 
                    }}
                >
                    &larr; Back to Chart
                </Link>
            </div>
            
            <p style={{ color: '#666', marginBottom: '2rem' }}>
                Explore your active holdings and full transaction logs in one place.
            </p>

            {/* Use the new Tabs component to toggle views */}
            <DetailsTabs holdings={holdingsDataForTable} transactions={investments} />
        </main>
    );
}
