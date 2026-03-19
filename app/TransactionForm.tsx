'use client';

import { useState, useRef, useEffect } from 'react';
import { addTransaction, searchSymbol } from './actions';

export default function TransactionForm() {
    const formRef = useRef<HTMLFormElement>(null);

    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedExchange, setSelectedExchange] = useState('NSE');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const delayDebounce = setTimeout(async () => {
            if (query.trim().length >= 2 && showDropdown) {
                setIsSearching(true);
                const results = await searchSymbol(query);
                setSuggestions(results);
                setIsSearching(false);
            } else {
                setSuggestions([]);
            }
        }, 400);

        return () => clearTimeout(delayDebounce);
    }, [query, showDropdown]);

    const handleSubmit = async (formData: FormData) => {
        await addTransaction(formData);
        formRef.current?.reset();
        setQuery('');
        setSuggestions([]);
    };

    return (
        <form ref={formRef} action={handleSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start', background: '#f9fafb', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', border: '1px solid #e5e7eb' }}>

            {/* Symbol Input with Autocomplete Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative', width: '220px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Symbol or Company Name</label>
                <input
                    name="symbol"
                    autoComplete="off"
                    required
                    placeholder="e.g. INFY or Infosys"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none', width: '100%' }}
                />

                {/* Dropdown Container */}
                {showDropdown && (query.length >= 2) && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #d1d5db', borderRadius: '6px', zIndex: 10, maxHeight: '250px', overflowY: 'auto', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', marginTop: '4px' }}>
                        {isSearching && suggestions.length === 0 ? (
                            <div style={{ padding: '12px', fontSize: '0.85rem', color: '#6b7280', textAlign: 'center' }}>Searching...</div>
                        ) : suggestions.length > 0 ? (
                            suggestions.map((s, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => {
                                        setQuery(s.baseSymbol);
                                        setSelectedExchange(s.exchange);
                                        setShowDropdown(false);
                                    }}
                                    style={{
                                        padding: '10px 12px',
                                        borderBottom: idx < suggestions.length - 1 ? '1px solid #e5e7eb' : 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 600, color: '#111827' }}>{s.baseSymbol}</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: s.exchange === 'NSE' ? '#0ea5e9' : '#f59e0b', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                                            {s.exchange}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '0.8rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {s.name}
                                    </span>
                                </div>
                            ))
                        ) : (
                            !isSearching && <div style={{ padding: '12px', fontSize: '0.85rem', color: '#6b7280', textAlign: 'center' }}>No results found</div>
                        )}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '90px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Action</label>
                <select name="type" required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', background: 'white', outline: 'none' }}>
                    <option value="Buy">Buy</option>
                    <option value="Sell">Sell</option>
                </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '90px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Exchange</label>
                <select
                    name="exchange"
                    required
                    value={selectedExchange}
                    onChange={(e) => setSelectedExchange(e.target.value)}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', background: 'white', outline: 'none' }}
                >
                    <option value="NSE">NSE</option>
                    <option value="BSE">BSE</option>
                </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Date</label>
                <input type="date" name="date" required style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '90px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Qty</label>
                <input type="number" name="quantity" required min="1" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '120px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500 }}>Price</label>
                <input type="number" step="0.01" name="price" required min="0.01" placeholder="₹" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #d1d5db', outline: 'none' }} />
            </div>

            <button type="submit" style={{ padding: '8px 24px', borderRadius: '4px', background: '#2563eb', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', height: '37px', marginTop: '23px', marginLeft: 'auto' }}>
                Add Trade
            </button>
        </form>
    );
}
