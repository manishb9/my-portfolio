'use client';

import { useState, useEffect } from 'react';
import { getScriptTimeline } from './actions';
import PriceHistoryChart from './PriceHistoryChart';

interface PriceVsAvgSectionProps {
    symbols: string[];
}

export default function PriceVsAvgSection({ symbols }: PriceVsAvgSectionProps) {
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
                console.error("Failed to fetch price timeline:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchTimeline();
    }, [selectedSymbol]);

    if (symbols.length === 0) return null;

    return (
        <div style={{ marginTop: '3rem', marginBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#111827' }}>Price vs Average Analysis</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <label htmlFor="price-avg-select" style={{ fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>Select Script:</label>
                    <select 
                        id="price-avg-select"
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
                            outline: 'none'
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
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
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
                        <div style={{ color: '#111827', fontWeight: 600 }}>Updating Analysis...</div>
                    </div>
                )}
                
                <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>{selectedSymbol} Price Tracker</span>
                    {chartData.length > 0 && (
                        <div style={{ background: '#111827', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                            Last Price: ₹{chartData[chartData.length - 1].currentPrice?.toFixed(2)}
                        </div>
                    )}
                </div>

                {chartData.length > 0 ? (
                    <PriceHistoryChart data={chartData} />
                ) : (
                    <div style={{ display: 'flex', height: '300px', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                        No historical pricing data available.
                    </div>
                )}
            </div>
        </div>
    );
}
