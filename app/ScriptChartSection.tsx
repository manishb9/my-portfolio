'use client';

import { useState, useEffect } from 'react';
import { getScriptTimeline } from './actions';
import StockChart from './StockChart';

interface ScriptChartSectionProps {
    symbols: string[];
}

export default function ScriptChartSection({ symbols }: ScriptChartSectionProps) {
    const [selectedSymbol, setSelectedSymbol] = useState<string>(symbols[0] || '');
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [lastMarketDate, setLastMarketDate] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedSymbol) return;

        async function fetchTimeline() {
            setLoading(true);
            try {
                const res = await getScriptTimeline(selectedSymbol);
                setChartData(res.chartData);
                setLastMarketDate(res.lastMarketDate);
            } catch (error) {
                console.error("Failed to fetch script timeline:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchTimeline();
    }, [selectedSymbol]);

    if (symbols.length === 0) return null;

    return (
        <div style={{ marginTop: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#111827' }}>Script Performance Analysis</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label htmlFor="script-select" style={{ fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>Select Script:</label>
                    <select 
                        id="script-select"
                        value={selectedSymbol}
                        onChange={(e) => setSelectedSymbol(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            background: '#fff',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: '#111827',
                            cursor: 'pointer',
                            outline: 'none',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                    >
                        {symbols.map(sym => (
                            <option key={sym} value={sym}>{sym}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div style={{ 
                background: '#fff', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                border: '1px solid #e5e7eb',
                position: 'relative',
                minHeight: '350px'
            }}>
                {loading && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        borderRadius: '12px'
                    }}>
                        <div style={{ color: '#111827', fontWeight: 600 }}>Updating Chart...</div>
                    </div>
                )}
                
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>{selectedSymbol} Tracker</span>
                    {lastMarketDate && <span style={{ fontSize: '0.8rem', color: '#666' }}>As of {lastMarketDate}</span>}
                </div>

                {chartData.length > 0 ? (
                    <>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem', background: '#f9fafb', padding: '15px', borderRadius: '10px' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Current Price</p>
                                <p style={{ margin: '2px 0 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>₹{chartData[chartData.length - 1].currentPrice?.toFixed(2)}</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Avg Buy-In</p>
                                <p style={{ margin: '2px 0 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>₹{chartData[chartData.length - 1].avgPrice?.toFixed(2)}</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Total Invested</p>
                                <p style={{ margin: '2px 0 0 0', fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>₹{chartData[chartData.length - 1].investedValue?.toLocaleString()}</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase' }}>Current Value</p>
                                <p style={{ margin: '2px 0 0 0', fontSize: '1.1rem', fontWeight: 700, color: (chartData[chartData.length - 1].portfolioValue >= chartData[chartData.length-1].investedValue ? '#10b981' : '#ef4444') }}>₹{chartData[chartData.length - 1].portfolioValue?.toLocaleString()}</p>
                            </div>
                        </div>
                        <StockChart data={chartData} />
                    </>
                ) : (
                    <div style={{ display: 'flex', height: '300px', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                        No historical data available for this script.
                    </div>
                )}
            </div>
        </div>
    );
}
