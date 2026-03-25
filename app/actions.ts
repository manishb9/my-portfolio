'use server'

import { getDb } from '../lib/db';
import { revalidatePath } from 'next/cache';
import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance({ suppressNotices: ['ripHistorical'] });

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
        return [];
    }
}

export async function addTransaction(formData: FormData) {
    const db = await getDb();
    const qty = parseInt(formData.get('quantity') as string) || 0;
    const price = parseFloat(formData.get('price') as string) || 0;
    
    await db.run(
        `INSERT INTO transactions (script, date, qty, price, amount) VALUES (?, ?, ?, ?, ?)`,
        [
            formData.get('symbol')?.toString().toUpperCase(),
            formData.get('date'),
            qty,
            price,
            qty * price
        ]
    );
    revalidatePath('/');
}

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

export async function deleteTransaction(id: number) {
    const db = await getDb();
    await db.run('DELETE FROM transactions WHERE id = ?', [id]);
    revalidatePath('/');
}
