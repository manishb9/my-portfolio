import pandas as pd
import json
import sys

# 🔹 CONFIG
FILE_PATH = "Trade Data.xlsx"
OUTPUT_FILE = "output.json"

# 🔹 LOAD FILE
try:
    df = pd.read_excel(FILE_PATH)
except Exception as e:
    print(f"❌ Error reading file: {e}")
    sys.exit()

# 🔹 CLEAN COLUMN NAMES (handles spaces, hidden chars)
df.columns = (
    df.columns
    .str.strip()
    .str.replace("\n", "", regex=True)
    .str.replace("\r", "", regex=True)
)

print("✅ Detected columns:", df.columns.tolist())

# 🔹 EXPECTED COLUMNS
EXPECTED_COLUMNS = ["Script", "Date", "Qty", "Price", "Amount", "Holding Days"]

# 🔹 VALIDATE COLUMNS
missing_cols = [col for col in EXPECTED_COLUMNS if col not in df.columns]
if missing_cols:
    print(f"❌ Missing columns: {missing_cols}")
    print("👉 Available columns:", df.columns.tolist())
    sys.exit()

# 🔹 CLEAN DATA

# Amount → remove commas safely
df["Amount"] = (
    df["Amount"]
    .astype(str)
    .str.replace(",", "")
    .astype(float)
)

# Qty → int
df["Qty"] = df["Qty"].astype(int)

# Price → float
df["Price"] = df["Price"].astype(float)

# Holding Days → int
df["Holding Days"] = df["Holding Days"].astype(int)

# Date → safe formatting
def format_date(val):
    try:
        return pd.to_datetime(val).strftime("%d/%m/%y")
    except:
        return str(val)

df["Date"] = df["Date"].apply(format_date)

# 🔹 GROUP & BUILD JSON
result = {"scripts": []}

grouped = df.groupby("Script")

for script, group in grouped:
    total_quantity = int(group["Qty"].sum())
    total_invested = round(group["Amount"].sum(), 2)

    transactions = []
    for _, row in group.iterrows():
        transactions.append({
            "date": row["Date"],
            "quantity": int(row["Qty"]),
            "price": float(row["Price"]),
            "amount": float(row["Amount"]),
            "holdingDays": int(row["Holding Days"])
        })

    result["scripts"].append({
        "scriptName": script,
        "totalQuantity": total_quantity,
        "totalInvestedValue": total_invested,
        "transactions": transactions
    })

# 🔹 SORT SCRIPTS (optional but useful)
result["scripts"] = sorted(result["scripts"], key=lambda x: x["scriptName"])

# 🔹 WRITE OUTPUT
try:
    with open(OUTPUT_FILE, "w") as f:
        json.dump(result, f, indent=2)
    print(f"✅ JSON generated successfully: {OUTPUT_FILE}")
except Exception as e:
    print(f"❌ Error writing JSON: {e}")