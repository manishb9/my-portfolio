/**
 * `use server` is a powerful Next.js directive. It tells Next.js that ALL functions
 * inside this file must ONLY run securely on the server.
 * When a user submits a form on their browser, it securely makes a hidden API call to these functions!
 */
'use server'

import { getDb } from '../lib/db';
import { revalidatePath } from 'next/cache';
import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance({ suppressNotices: ['ripHistorical'] });

/**
 * WHAT THIS DOES:
 * Searches Yahoo Finance for stock symbols dynamically as you type (Autocomplete).
 * 
 * INPUTS: 
 * `query`: A string typed by the user. Example: "Infosys"
 * 
 * OUTPUTS:
 * Returns an array of matching tickers specific to India (NSE / BSE).
 * Example: [{ symbol: "INFY.NS", name: "Infosys Limited", exchange: "NSE", baseSymbol: "INFY" }]
 */
export async function searchSymbol(query: string) {
    if (!query || query.length < 2) return [];
    try {
        const res = await yf.search(query);
        // Filter out specifically Indian exchanges (NSE and BSE) mapped natively in Yahoo
        return (res.quotes as any[])
            .filter(q => q.symbol && (q.symbol.endsWith('.NS') || q.symbol.endsWith('.BO')))
            .map(q => ({
                symbol: q.symbol,
                name: q.shortname || q.longname || q.symbol,
                exchange: q.symbol.endsWith('.NS') ? 'NSE' : 'BSE',
                baseSymbol: q.symbol.split('.')[0]
            }));
    } catch (error) {
        return []; // Fail gracefully returning nothing instead of throwing an error to the user
    }
}

/**
 * WHAT THIS DOES:
 * Inserts a brand new stock trade exactly into your SQLite database natively!
 * 
 * INPUTS:
 * `formData`: A standard browser FormData object containing input fields from the HTML `<form>`.
 */
export async function addTransaction(formData: FormData) {
    const db = await getDb(); // Securely connect to SQLite
    
    // Parse strings into Numbers! Forms always send data as Strings.
    const qty = parseInt(formData.get('quantity') as string) || 0;
    const price = parseFloat(formData.get('price') as string) || 0;
    
    // Using `?` prevents SQL Injection natively natively! Never write `${price}` inside SQL.
    await db.run(
        `INSERT INTO transactions (script, date, qty, price, amount) VALUES (?, ?, ?, ?, ?)`,
        [
            formData.get('symbol')?.toString().toUpperCase(), // Force symbols to UPPERCASE natively
            formData.get('date'),
            qty,
            price,
            qty * price // Automatically calculate Total Amount natively 
        ]
    );
    
    // Revalidation: Tells Next.js to flush its internal page cache natively and refresh '/' entirely natively!
    // This allows the table rendering seamlessly without weird manual state management inherently!
    revalidatePath('/'); 
}

/**
 * WHAT THIS DOES:
 * Updates an ALREADY EXISTING mapped database transaction intrinsically natively.
 */
export async function updateTransaction(formData: FormData) {
    const db = await getDb();
    const qty = parseInt(formData.get('quantity') as string) || 0;
    const price = parseFloat(formData.get('price') as string) || 0;
    
    await db.run(
        `UPDATE transactions SET script=?, date=?, qty=?, price=?, amount=? WHERE id=?`,
        [
            formData.get('symbol')?.toString().toUpperCase(),
            formData.get('date'),
            qty,
            price,
            qty * price,
            parseInt(formData.get('id') as string)
        ]
    );
    revalidatePath('/');
}

/**
 * WHAT THIS DOES:
 * Safely permanently natively deletes specifically explicitly provided Row ID's directly seamlessly!
 */
export async function deleteTransaction(id: number) {
    const db = await getDb();
    // Again, `?` natively sanitizes specific inputs explicitly!
    await db.run('DELETE FROM transactions WHERE id = ?', [id]);
    revalidatePath('/'); // Refresh UI instantly
}
