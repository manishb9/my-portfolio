'use client';

export default function HoldingsTable({ holdings }: { holdings: any }) {
    const thStyle = { textAlign: 'left' as const, padding: '12px 16px', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontWeight: 600, fontSize: '0.875rem' };
    const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '0.875rem' };

    const totalInvested = holdings.reduce((sum: number, h: any) => sum + h.invested, 0);
    const totalCurrent = holdings.reduce((sum: number, h: any) => sum + h.currentValue, 0);

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
                    {holdings.map((h: any, i: number) => {
                        const pnl = h.currentValue - h.invested;
                        const pnlPercent = h.invested > 0 ? (pnl / h.invested) * 100 : 0;
                        return (
                            <tr key={i}>
                                <td style={{ ...tdStyle, fontWeight: 600 }}>{h.symbol}</td>
                                <td style={tdStyle}>{h.quantity}</td>
                                <td style={tdStyle}>₹{h.avgPrice.toFixed(2)}</td>
                                <td style={tdStyle}>₹{h.invested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td style={tdStyle}>₹{h.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td style={tdStyle}>₹{h.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
