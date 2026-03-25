const xlsx = require('xlsx');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'portfolio.db');
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      script TEXT,
      date TEXT,
      qty INTEGER,
      price REAL,
      amount REAL,
      holding_days INTEGER,
      tax REAL,
      remark TEXT
    )
  `);

  const wb = xlsx.readFile('Trade Data.xlsx');
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  const stmt = db.prepare(`
    INSERT INTO transactions (
      script, date, qty, price, amount, holding_days, tax, remark
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  rows.forEach(row => {
    let rawDate = row['Date'];
    let formattedDate = rawDate;
    
    // Formatting from DD/MM/YY or DD/MM/YYYY nicely natively!
    if (typeof rawDate === 'number') {
        const d = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
        d.setUTCHours(0, 0, 0, 0);
        formattedDate = d.toISOString().split('T')[0];
    } else if (typeof rawDate === 'string' || rawDate instanceof Date) {
        const d = new Date(rawDate);
        if(!isNaN(d)) formattedDate = d.toISOString().split('T')[0];
    }

    const parseNum = (val) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        return parseFloat(val.toString().replace(/,/g, '')) || 0;
    };

    stmt.run(
      row['Script']?.toString().replace(/\n|\r/g, '').trim(),
      formattedDate,
      parseInt(row['Qty']) || 0,
      parseNum(row['Price']),
      parseNum(row['Amount']),
      parseInt(row['Holding Days']) || 0,
      parseNum(row['Tax']),
      row['Remark']?.toString() || ''
    );
  });

  stmt.finalize();
  console.log('Imported rows perfectly into new columns scheme.');
});
db.close();
