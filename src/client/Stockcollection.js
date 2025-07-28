import React, { useEffect, useState } from 'react';
import axios from 'axios';

const allStocks = [
  "AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NFLX", "NVDA",
  "IBM", "ORCL", "INTC", "CSCO", "ADBE", "CRM", "PYPL", "QCOM",
  "TXN", "AMD", "SBUX", "BA", "CAT", "GE", "MMM", "NKE", "LMT",
  "GS", "JPM", "BAC", "WMT", "HD", "KO", "PEP", "DIS", "VZ", "T",
  "FDX", "HON", "UPS", "LRCX", "NOW", "MDLZ", "MRK", "CVX", "XOM", "COST",
  "BLK", "SCHW", "BKNG", "GILD", "ISRG", "SYK", "ZTS", "ADI", "CSX", "ETN",
  "ADP", "SPGI", "TJX", "CB", "SO", "USB", "CCI", "PLD", "DHR", "SHW",
  "EL", "GM", "F", "TMUS", "TGT", "MO", "SOFI", "SQ", "PYPL", "SHOP",
  "UBER", "LYFT", "TWTR", "SNAP", "ZM", "DOCU", "OKTA", "ROKU", "CRWD", "NET",
  "DDOG", "SNOW", "FSLY", "TEAM", "WDAY", "ZS", "MELI", "PINS", "DKNG", "ROST"
];

const PAGE_SIZE = 20;

export default function Stockcollection() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(allStocks.length / PAGE_SIZE);

  useEffect(() => {
    const fetchStocksForPage = async () => {
      setLoading(true);
      const startIdx = (page - 1) * PAGE_SIZE;
      const symbolsSlice = allStocks.slice(startIdx, startIdx + PAGE_SIZE);
      const symbolsString = symbolsSlice.join(',');

      try {
        const res = await axios.get(`http://localhost:3001/api/stocks/batch?symbols=${symbolsString}`);
        setStocks(res.data);
      } catch (error) {
        console.error('Failed to fetch stocks:', error);
        setStocks([]);
      }
      setLoading(false);
    };

    fetchStocksForPage();
  }, [page]);

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto' }}>
      <h1>Stocks (Page {page} of {totalPages})</h1>
      {loading ? (
        <p>Loading stocks...</p>
      ) : (
        <ul>
          {stocks.map(stock => (
            <li key={stock.symbol}>
              <b>{stock.symbol}</b>: ${parseFloat(stock.price).toFixed(2)} ({stock.changePercent})
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={() => goToPage(page - 1)} disabled={page === 1}>Previous</button>
        <button onClick={() => goToPage(page + 1)} disabled={page === totalPages}>Next</button>
      </div>
    </div>
  );
}