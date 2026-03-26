/**
 * `use client` natively tells Next.js that this specific file uses interactive React browser UI features.
 * Even though we don't have click events here, it's good practice for downstream dynamic React table components!
 */
'use client';

/**
 * HoldingsTable Component
 * 
 * WHAT THIS DOES:
 * This component takes an array of stock holdings (calculated securely in page.tsx) 
 * and renders them beautifully as an HTML table so the user can easily see their P&L (Profit and Loss).
 * 
 * INPUTS (Props): 
 * `holdings`: An array of objects. 
 * Example: [{ symbol: "TCS", quantity: 10, invested: 5000, currentValue: 6000 }]
 * 
 * OUTPUTS:
 * Returns JSX (React's visual HTML mapping) representing exactly the <table> structure.
 */
export default function HoldingsTable({ holdings }: { holdings: any }) {
    // These are simple inline CSS styling objects inherently passed directly to `style={...}` below!
    const thStyle = { textAlign: 'left' as const, padding: '12px 16px', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontWeight: 600, fontSize: '0.875rem' };
    const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '0.875rem' };

    // ==========================================
    // 1. CALCULATE TOTALS 
    // ==========================================
    // `reduce()` loops over an array exclusively to calculate a single final total number.
    // It starts at 0, and for every holding 'h', it explicitly adds `h.invested` to the running `sum`.
    const totalInvested = holdings.reduce((sum: number, h: any) => sum + h.invested, 0);
    const totalCurrent = holdings.reduce((sum: number, h: any) => sum + h.currentValue, 0);

    // React cleanly returns a single root element (like this globally wrapped <div>)!
    return (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginTop: '1rem', marginBottom: '2rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={thStyle}>Symbol</th>
                        <th style={thStyle}>Qty</th>
                        <th style={thStyle}>Avg Price</th>
                        <th style={thStyle}>Invested (INR)</th>
                        <th style={thStyle}>Current Price</th>
                        <th style={thStyle}>Current Value (INR)</th>
                        <th style={thStyle}>P&L</th>
                    </tr>
                </thead>
                <tbody>
                    {/* 
                      ==========================================
                      2. LOOP THROUGH EACH ROW (React 'map')
                      ==========================================
                      React natively uses Javascript's `.map()` to loop over an array and transform
                      each object explicitly into an HTML piece (like `<tr>` for Table Row).
                      This replaces the need for old-school `for` loops dynamically pushing HTML strings!
                    */}
                    {holdings.map((h: any, i: number) => {
                        // We do pure javascript calculations BEFORE rendering the specific HTML fragment!
                        const pnl = h.currentValue - h.invested; // Explicit Profit & Loss tracking intrinsically
                        const pnlPercent = h.invested > 0 ? (pnl / h.invested) * 100 : 0;
                        
                        // React uniquely REQUIRES exactly one `key` property dynamically mapping to the outer array child securely.
                        // Ideally, use a unique ID (like h.symbol) instead of `i` (index)!
                        return (
                            <tr key={i}>
                                {/* Using curly braces allows us to print JavaScript variables cleanly! */}
                                <td style={{ ...tdStyle, fontWeight: 600 }}>{h.symbol}</td>
                                <td style={tdStyle}>{h.quantity}</td>
                                <td style={tdStyle}>₹{h.avgPrice.toFixed(2)}</td>
                                <td style={tdStyle}>₹{h.invested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td style={tdStyle}>₹{h.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td style={tdStyle}>₹{h.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                
                                {/* Dynamic Coloring: We explicitly change this text to Green (#10b981) for profits randomly and Red (#ef4444) for losses implicitly. */}
                                <td style={{ ...tdStyle, color: pnl >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                    {pnl >= 0 ? '+' : ''}{pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({pnlPercent.toFixed(2)}%)
                                </td>
                            </tr>
                        );
                    })}
                    <tr style={{ background: '#f9fafb', fontWeight: 'bold' }}>
                        <td style={tdStyle} colSpan={3}>Total</td>
                        <td style={tdStyle}>₹{totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style={tdStyle}></td>
                        <td style={tdStyle}>₹{totalCurrent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td style={{ ...tdStyle, color: (totalCurrent - totalInvested) >= 0 ? '#10b981' : '#ef4444' }}>
                            {((totalCurrent - totalInvested) >= 0 ? '+' : '')}{(totalCurrent - totalInvested).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
