'use client';

import { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceDot
} from 'recharts';
import { DailyPerformance } from '../types';

const PriceTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data: DailyPerformance = payload[0].payload;
        const dateObj = new Date(label);
        const formattedDate = `${dateObj.toLocaleString('default', { month: 'short' })} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;

        return (
            <div style={{ background: '#fff', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{formattedDate}</p>
                <div style={{ marginBottom: '8px' }}>
                    <p style={{ margin: '4px 0', color: '#10b981', fontSize: '0.9rem' }}>
                        Market Price: <span style={{ fontWeight: 600 }}>₹{data.currentPrice?.toLocaleString()}</span>
                    </p>
                    <p style={{ margin: '4px 0', color: '#ef4444', fontSize: '0.9rem' }}>
                        Avg Buy Price: <span style={{ fontWeight: 600 }}>₹{data.avgPrice?.toLocaleString()}</span>
                    </p>
                    <p style={{ margin: '4px 0', color: '#4b5563', fontSize: '0.85rem' }}>
                        Gap: <span style={{ fontWeight: 600, color: (data.currentPrice || 0) >= (data.avgPrice || 0) ? '#10b981' : '#ef4444' }}>
                            {((((data.currentPrice || 0) - (data.avgPrice || 0)) / (data.avgPrice || 1)) * 100).toFixed(2)}%
                        </span>
                    </p>
                </div>
                {data.isPurchase && data.purchaseDetails && (
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px', marginTop: '4px' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>Purchased Today:</p>
                        {data.purchaseDetails.map((p, i) => (
                            <p key={i} style={{ margin: '2px 0', fontSize: '0.8rem', color: '#374151' }}>
                                • {p.quantity}x @ ₹{p.price.toLocaleString()}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    return null;
};

export default function PriceHistoryChart({ data }: { data: DailyPerformance[] }) {
    const displayData = data.slice(-30);
    const startDate = displayData[0].date;
    const [hoveredPurchase, setHoveredPurchase] = useState<{ x: number, y: number, day: string, price: number, qty: number } | null>(null);

    // CALCULATE DYNAMIC Y-DOMAIN TO INCLUDE ALL HISTORICAL PURCHASES
    const allRelevantPrices = [
        ...displayData.map(d => d.currentPrice || 0),
        ...displayData.map(d => d.avgPrice || 0),
        ...data.filter(d => d.isPurchase).flatMap(d => d.purchaseDetails?.map(p => p.price) || [])
    ].filter(p => p > 0);
    
    const minP = allRelevantPrices.length > 0 ? Math.min(...allRelevantPrices) * 0.98 : 'auto';
    const maxP = allRelevantPrices.length > 0 ? Math.max(...allRelevantPrices) * 1.02 : 'auto';

    return (
        <div style={{ width: '100%', height: 400, position: 'relative' }}>
            {/* Custom Hover Popup for Reference Dots */}
            {hoveredPurchase && (
                <div style={{
                    position: 'absolute',
                    top: Math.max(0, hoveredPurchase.y - 100),
                    left: Math.max(0, hoveredPurchase.x + 10),
                    background: '#111827',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    zIndex: 1000,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    pointerEvents: 'none',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 700, color: '#9ca3af' }}>{hoveredPurchase.day}</p>
                    <p style={{ margin: 0 }}>Qty: <span style={{ fontWeight: 600 }}>{hoveredPurchase.qty}</span></p>
                    <p style={{ margin: 0 }}>Price: <span style={{ fontWeight: 600 }}>₹{hoveredPurchase.price.toLocaleString()}</span></p>
                </div>
            )}

            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(value) => {
                            const d = new Date(value);
                            return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
                        }}
                        minTickGap={40}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <YAxis
                        domain={[minP, maxP]}
                        tickFormatter={(value) => `₹${value.toLocaleString()}`}
                        tick={{ fill: '#6b7280', fontSize: 12 }}
                    />
                    <Tooltip content={<PriceTooltip />} />
                    <Legend iconType="plainline" wrapperStyle={{ paddingTop: '10px' }} />
                    <Line
                        name="Avg Buy Price"
                        type="stepAfter"
                        dataKey="avgPrice"
                        stroke="#ef4444"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                    />
                    <Line
                        name="Market Price"
                        type="monotone"
                        dataKey="currentPrice"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                    />

                    {/* All-time Y-Axis Purchase price indicators */}
                    {data.filter(day => day.isPurchase).map((day, idx) => (
                        day.purchaseDetails?.map((purchase, pIdx) => (
                            <ReferenceDot
                                key={`buy-${idx}-${pIdx}`}
                                x={startDate}
                                y={purchase.price}
                                r={5}
                                fill="#101828"
                                stroke="#fff"
                                strokeWidth={1}
                                onMouseEnter={(e: any) => {
                                    if (e && e.cx && e.cy) {
                                        setHoveredPurchase({
                                            x: e.cx,
                                            y: e.cy,
                                            day: day.date,
                                            price: purchase.price,
                                            qty: purchase.quantity
                                        });
                                    }
                                }}
                                onMouseLeave={() => setHoveredPurchase(null)}
                            />
                        ))
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
