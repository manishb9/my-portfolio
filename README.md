# Portfolio Tracker

A minimal, lightning-fast interactive portfolio tracking application built natively within **Next.js**.

This project solves the complexities of tracking various purchases across different exchanges (like **NSE** and **BSE**) over your entire investment timeline. It features deeply integrated autocomplete functions scanning thousands of listed real-world equities via Yahoo Finance, allowing you to instantly log buy/sell positions and visualize your exact total invested capital versus your fluid portfolio market value.

---

## 🚀 Key Features

*   **Two-in-One Performance Chart**: Overlaps a step-chart representing your absolute cash deployment against a dynamically fluctuating historic curve representing your precise market valuation over time.
*   **Intelligent Local Database (SQLite)**: A zero-configuration local embedded `sqlite3` database silently spins up inside Next.js to indefinitely persist your inputted transactions completely privately. There is no separate backend service to run!
*   **Real-time Smart Autocomplete**: The transaction form natively hits Yahoo Finance in the background securely via Server Actions. Type any corporate stock like "TCS" or "Infosys" and the backend parses out exact Indian Exchange suffixes (`.NS`/`.BO`) implicitly without any tricky API keys.

---

## 🖥 Requirements

*   **Node.js**: `v18.x` or higher
*   **npm** (comes with Node)

---

## 🛠 Local Setup & Installation

If you clone this repository and want to run it flawlessly on your local machine:

**1. Install Dependencies**
Open your terminal inside the project root and run:
```bash
npm install
```
*This downloads the exact required packages including `sqlite3`, `recharts`, `yahoo-finance2`, and natively resolves the Next.js ecosystem.*

**2. Start the Application Engine**
Because this app relies tightly on Next.js **Server Actions** exclusively for its data layer, no secondary Node.js environment or standalone database software is required!
```bash
npm run dev
```

**3. Open the App**
Open your web browser and navigate to:
```
http://localhost:3000
```

---

## 🗄 How the Database works (Zero-Setup)

You don't need to install MySQL, PostgreSQL, or MongoDB. 

The first time you successfully spin up the app and fire it open seamlessly, our `lib/db.ts` file automatically detects if a `portfolio.db` file exists. If it doesn't, it initializes a strict SQLite environment and maps up your entire `transactions` schema cleanly. 
- **Persisted**: If you restart your laptop or server, your data guarantees itself perfectly intact inside `portfolio.db`.
- **Private**: By default, `.gitignore` hides `.db` files deliberately so you never accidentally upload your highly private financial records strictly to GitHub.

---

## 📦 Deployment (VPS Guide)

Because we isolated everything directly inside the React/Next.js environment without standalone services, deploying this onto an Ubuntu/Debian VPS is a breeze:
1. Clone this repository onto your server.
2. Run `npm install` and `npm run build`.
3. Startup Next.js strictly using standard PM2 configs (`pm2 start npm --name "portfolio" -- start`).
4. Reverse-proxy port `3000` out strictly through NGINX!
