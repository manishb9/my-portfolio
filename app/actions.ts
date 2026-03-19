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
    await db.run(
        `INSERT INTO transactions (symbol, type, exchange, date, quantity, price) VALUES (?, ?, ?, ?, ?, ?)`,
        [
            formData.get('symbol')?.toString().toUpperCase(),
            formData.get('type'),
            formData.get('exchange'),
            formData.get('date'),
            parseInt(formData.get('quantity') as string),
            parseFloat(formData.get('price') as string)
        ]
    );
    revalidatePath('/');
}

export async function updateTransaction(formData: FormData) {
    const db = await getDb();
    await db.run(
        `UPDATE transactions SET symbol=?, type=?, exchange=?, date=?, quantity=?, price=? WHERE id=?`,
        [
            formData.get('symbol')?.toString().toUpperCase(),
            formData.get('type'),
            formData.get('exchange'),
            formData.get('date'),
            parseInt(formData.get('quantity') as string),
            parseFloat(formData.get('price') as string),
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
