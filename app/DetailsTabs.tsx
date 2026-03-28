'use client';

import { useState } from 'react';
import HoldingsTable from './HoldingsTable';
import TransactionTable from './TransactionTable';
import { Transaction } from '../types';

interface DetailsTabsProps {
    holdings: any[];
    transactions: Transaction[];
}

export default function DetailsTabs({ holdings, transactions }: DetailsTabsProps) {
    const [activeTab, setActiveTab] = useState<'holdings' | 'transactions'>('holdings');

    const tabButtonStyle = (isActive: boolean) => ({
        padding: '10px 20px',
        cursor: 'pointer',
        border: 'none',
        background: isActive ? '#111827' : 'transparent',
        color: isActive ? '#fff' : '#6b7280',
        borderRadius: '6px',
        fontWeight: 600,
        fontSize: '0.9rem',
        transition: 'all 0.2s'
    });

    return (
        <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem', background: '#e5e7eb', padding: '5px', borderRadius: '8px', width: 'fit-content' }}>
                <button 
                    onClick={() => setActiveTab('holdings')}
                    style={tabButtonStyle(activeTab === 'holdings')}
                >
                    Current Holdings
                </button>
                <button 
                    onClick={() => setActiveTab('transactions')}
                    style={tabButtonStyle(activeTab === 'transactions')}
                >
                    Transaction History
                </button>
            </div>

            {activeTab === 'holdings' ? (
                <div>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#111827' }}>Current Holdings Snapshot</h2>
                    <HoldingsTable holdings={holdings} />
                </div>
            ) : (
                <div>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#111827' }}>Full Transaction History</h2>
                    <TransactionTable transactions={transactions} />
                </div>
            )}
        </div>
    );
}
