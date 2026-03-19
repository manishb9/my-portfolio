import yahooFinance from 'yahoo-finance2';

async function main() {
  const res = await yahooFinance.search('Inf');
  console.log(JSON.stringify(res.quotes.slice(0, 3), null, 2));
}

main();
