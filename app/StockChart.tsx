'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

interface DataPoint {
    date: string;
    investedValue: number;
    portfolioValue: number;
    isPurchase: boolean;
    purchaseDetails?: { symbol: string; quantity: number; buyPrice: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const dateObj = new Date(label);
        const formattedDate = `${dateObj.toLocaleString('default', { month: 'short' })} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;

        return (
            <div style={{ background: '#fff', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{formattedDate}</p>
                <p style={{ margin: '4px 0', color: '#6b7280' }}>
                    Total Invested: <span style={{ fontWeight: 600 }}>₹{data.investedValue.toLocaleString()}</span>
                </p>
                <p style={{ margin: '4px 0', color: '#2563eb' }}>
                    Portfolio Value: <span style={{ fontWeight: 600 }}>₹{data.portfolioValue.toLocaleString()}</span>
                </p>

                {data.isPurchase && data.purchaseDetails && (
                    <div style={{ marginTop: '12px', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 600, color: '#111827' }}>Purchased Today:</p>
                        {data.purchaseDetails.map((p: any, i: number) => (
                            <p key={i} style={{ margin: '2px 0', fontSize: '0.85rem', color: '#374151' }}>
                                • {p.quantity}x {p.symbol} @ ₹{p.buyPrice.toLocaleString()}
                            </p>
                        ))}
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.isPurchase) {
        return (
            <circle
                cx={cx} cy={cy} r={5}
                stroke="#4b5563" strokeWidth={2} fill="#fff"
                style={{ cursor: 'pointer' }}
            />
        );
    }
    return null;
};

export default function StockChart({ data }: { data: DataPoint[] }) {
    return (
        <div style={{ width: '100%', height: 500 }}>
            {data.length === 0 ? (
                <p>No data available</p>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            tickFormatter={(value) => {
                                const d = new Date(value);
                                return `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
                            }}
                            minTickGap={40}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            tickLine={false}
                            axisLine={{ stroke: '#e5e7eb' }}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            tickFormatter={(value) => `₹${value.toLocaleString()}`}
                            tick={{ fill: '#6b7280', fontSize: 12 }}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="plainline"
                        />
                        {/* Invested Value Line */}
                        <Line
                            name="Total Invested"
                            type="stepAfter"
                            dataKey="investedValue"
                            stroke="#6b7280"
                            strokeWidth={3}
                            dot={<CustomDot />}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#4b5563' }}
                        />
                        {/* Portfolio Value Line */}
                        <Line
                            name="Portfolio Value"
                            type="monotone"
                            dataKey="portfolioValue"
                            stroke="#2563eb"
                            strokeWidth={3}
                            dot={false}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#2563eb' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}
