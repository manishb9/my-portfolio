'use client';

import { useState } from 'react';
import { updateTransaction, deleteTransaction } from './actions';

export default function TransactionTable({ transactions }: { transactions: any[] }) {
    const [editingId, setEditingId] = useState<number | null>(null);

    const thStyle = { textAlign: 'left' as const, padding: '12px 16px', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontWeight: 600, fontSize: '0.875rem' };
    const tdStyle = { padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '0.875rem' };
    const inputStyle = { padding: '4px', border: '1px solid #d1d5db', borderRadius: '4px', width: '100%' };

    return (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginTop: '3rem' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={thStyle}>Date</th>
                        <th style={thStyle}>Symbol</th>
                        <th style={thStyle}>Exchange</th>
                        <th style={thStyle}>Action</th>
                        <th style={thStyle}>Qty</th>
                        <th style={thStyle}>Price</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Manage</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(t => (
                        editingId === t.id ? (
                            <tr key={t.id} style={{ background: '#f9fafb' }}>
                                <td colSpan={7} style={{ padding: 0 }}>
                                    <form action={async (formData) => { await updateTransaction(formData); setEditingId(null); }} style={{ display: 'flex', padding: '12px', gap: '8px', alignItems: 'center' }}>
                                        <input type="hidden" name="id" value={t.id} />
                                        <input type="date" name="date" defaultValue={t.date} required style={inputStyle} />
                                        <input name="symbol" defaultValue={t.symbol} required style={inputStyle} />
                                        <select name="exchange" defaultValue={t.exchange} style={inputStyle}>
                                            <option value="NSE">NSE</option>
                                            <option value="BSE">BSE</option>
                                        </select>
                                        <select name="type" defaultValue={t.type} style={inputStyle}>
                                            <option value="Buy">Buy</option>
                                            <option value="Sell">Sell</option>
                                        </select>
                                        <input type="number" name="quantity" defaultValue={t.quantity} min="1" required style={inputStyle} />
                                        <input type="number" step="0.01" name="price" defaultValue={t.price} required style={inputStyle} />
                                        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
                                            <button type="submit" style={{ padding: '6px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Save</button>
                                            <button type="button" onClick={() => setEditingId(null)} style={{ padding: '6px 12px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                        </div>
                                    </form>
                                </td>
                            </tr>
                        ) : (
                            <tr key={t.id}>
                                <td style={tdStyle}>{t.date}</td>
                                <td style={{ ...tdStyle, fontWeight: 600 }}>{t.symbol}</td>
                                <td style={tdStyle}>{t.exchange}</td>
                                <td style={{ ...tdStyle, color: t.type === 'Buy' ? '#10b981' : '#ef4444', fontWeight: 600 }}>{t.type}</td>
                                <td style={tdStyle}>{t.quantity}</td>
                                <td style={tdStyle}>₹{t.price.toLocaleString()}</td>
                                <td style={{ ...tdStyle, textAlign: 'right' }}>
                                    <button onClick={() => setEditingId(t.id)} style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginRight: '12px', fontWeight: 600 }}>Edit</button>
                                    <button onClick={() => deleteTransaction(t.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                                </td>
                            </tr>
                        )
                    ))}
                    {transactions.length === 0 && (
                        <tr>
                            <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>No transactions found. Add one above!</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
