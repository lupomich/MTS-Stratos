// Mock Bond Data
const mockBonds = [
    { description: 'BTPSi 0.650 15/05/26', isin: 'IT0005415416', res: '0.5 yr', maturity: '98', resDays: '', ccy: 'EUR', bidYield: '2.2565', bidPrice: '99.58435', midPrice: '99.59018', midYield: '2.2339', askPrice: '99.59601' },
    { description: 'BTPSi 3.100 15/09/26', isin: 'IT0004735152', res: '01 yr', maturity: '221', resDays: '', ccy: 'EUR', bidYield: '-0.8765', bidPrice: '102.36397', midPrice: '102.36837', midYield: '-0.8841', askPrice: '102.37277' },
    { description: 'BTPSi 1.300 15/05/28', isin: 'IT0005246154', res: '03 yr', maturity: '829', resDays: '', ccy: 'EUR', bidYield: '-0.6449', bidPrice: '101.46919', midPrice: '101.47358', midYield: '-0.6428', askPrice: '101.47797' },
    { description: 'BTPSi 1.500 15/05/29', isin: 'IT0005343803', res: '03 yr', maturity: '1194', resDays: '', ccy: 'EUR', bidYield: '0.7723', bidPrice: '102.34233', midPrice: '102.34233', midYield: '0.7723', askPrice: '102.34233' },
    { description: 'BTPSi 0.400 15/05/30', isin: 'IT0005387052', res: '04 yr', maturity: '1559', resDays: '', ccy: 'EUR', bidYield: '0.8366', bidPrice: '97.98659', midPrice: '97.99189', midYield: '0.8033', askPrice: '97.99719' },
    { description: 'BTPSi 1.100 15/05/31', isin: 'IT0005438225', res: '05 yr', maturity: '1924', resDays: '', ccy: 'EUR', bidYield: '0.9534', bidPrice: '100.53328', midPrice: '100.53898', midYield: '0.9498', askPrice: '100.54468' },
    { description: 'BTPSi 1.250 15/09/32', isin: 'IT0005138928', res: '06 yr', maturity: '2415', resDays: '', ccy: 'EUR', bidYield: '0.9954', bidPrice: '101.99445', midPrice: '101.99489', midYield: '1.0093', askPrice: '101.99533' },
    { description: 'BTPSi 1.100 15/05/33', isin: 'IT0005462894', res: '07 yr', maturity: '2653', resDays: '', ccy: 'EUR', bidYield: '1.8976', bidPrice: '101.08291', midPrice: '101.09218', midYield: '1.3074', askPrice: '101.10145' },
    { description: 'BTPEi 2.350 15/09/35', isin: 'IT0003745541', res: '10 yr', maturity: '3508', resDays: '', ccy: 'EUR', bidYield: '1.3282', bidPrice: '109.20731', midPrice: '109.21919', midYield: '1.3269', askPrice: '109.23107' },
    { description: 'BTPcli 1.800 15/05/36', isin: 'IT0005288881', res: '10 yr', maturity: '3751', resDays: '', ccy: 'EUR', bidYield: '1.6459', bidPrice: '101.51314', midPrice: '101.51514', midYield: '1.6459', askPrice: '101.51714' },
    { description: 'BTPEi 2.400 15/05/37', isin: 'IT0005547812', res: '15 yr', maturity: '4846', resDays: '', ccy: 'EUR', bidYield: '1.8565', bidPrice: '106.09902', midPrice: '106.09902', midYield: '1.8565', askPrice: '106.09902' },
    { description: 'BTPcli 2.550 19/09/41', isin: 'IT0004644880', res: '20 yr', maturity: '5700', resDays: '', ccy: 'EUR', bidYield: '1.8835', bidPrice: '109.79104', midPrice: '109.79104', midYield: '1.8335', askPrice: '109.79104' },
    { description: 'BTPSi 0.150 15/05/51', isin: 'IT0005436701', res: '25 yr', maturity: '9229', resDays: '', ccy: 'EUR', bidYield: '2.0845', bidPrice: '62.32352', midPrice: '62.32352', midYield: '2.0845', askPrice: '62.32352' },
    { description: 'BTPcli 2.550 19/09/56', isin: 'IT0005647473', res: '30 yr', maturity: '11056', resDays: '', ccy: 'EUR', bidYield: '2.3773', bidPrice: '104.01438', midPrice: '104.01438', midYield: '2.3773', askPrice: '104.01438' }
];

// Mock Dealer Pricing Data
const mockDealerPricing = [
    { bidTime: '11:59:11', dealer: 'MS', bidAxe: '2', bidSize: '5', bidYield: '0.78', bidPrice: '99.9996', askYield: '2.2301', askPrice: '99.59018', askSize: '4', askAxe: 'D03', dealerAsk: 'MS', askTime: '11:49:21' },
    { bidTime: '12:31:22', dealer: 'MS', bidAxe: '2', bidSize: '2.5', bidYield: '0.8147', bidPrice: '99.957', askYield: '2.2381', askPrice: '99.59166', askSize: '17', askAxe: 'D06', dealerAsk: 'UNI', askTime: '11:56:52' },
    { bidTime: '12:48:19', dealer: 'UNI', bidAxe: '', bidSize: '7', bidYield: '2.2407', bidPrice: '99.58082', askYield: '2.2247', askPrice: '99.59255', askSize: '15', askAxe: 'D11', dealerAsk: '_D05', askTime: '11:48:53' },
    { bidTime: '10:19:16', dealer: '_D07', bidAxe: '', bidSize: '15', bidYield: '2.244', bidPrice: '99.58758', askYield: '2.2244', askPrice: '99.59262', askSize: '5', askAxe: 'D05', dealerAsk: '_D04', askTime: '12:21:35' },
    { bidTime: '11:56:42', dealer: '_D06', bidAxe: '11', bidSize: '17', bidYield: '2.2462', bidPrice: '99.58728', askYield: '2.2134', askPrice: '99.59546', askSize: '7', askAxe: 'D04', dealerAsk: '_D10', askTime: '12:30:19' },
    { bidTime: '10:59:35', dealer: '_D10', bidAxe: '22', bidSize: '', bidYield: '2.2564', bidPrice: '99.58438', askYield: '2.2132', askPrice: '99.59551', askSize: '22', askAxe: 'D10', dealerAsk: '_D03', askTime: '10:59:35' },
    { bidTime: '11:46:21', dealer: '_D03', bidAxe: '4', bidSize: '', bidYield: '2.2566', bidPrice: '99.58432', askYield: '2.2093', askPrice: '99.59651', askSize: '15', askAxe: 'D07', dealerAsk: 'MATRIX', askTime: '10:19:16' },
    { bidTime: '12:12:55', dealer: '_D03', bidAxe: '5', bidSize: '15', bidYield: '2.1591', bidPrice: '99.58300', askYield: '0.6790', askPrice: '99.992', askSize: '', askAxe: 'MATRIX', dealerAsk: 'MS', askTime: '11:59:11' },
    { bidTime: '11:48:53', dealer: '_D11', bidAxe: '15', bidSize: '', bidYield: '2.2603', bidPrice: '99.58338', askYield: '0.6528', askPrice: '99.9979', askSize: '2.5', askAxe: 'MS', dealerAsk: 'MS', askTime: '12:31:22' }
];

// Populate Bond Table
function populateBondTable() {
    const tbody = document.getElementById('bondTableBody');
    tbody.innerHTML = '';
    
    mockBonds.forEach((bond, index) => {
        const row = document.createElement('tr');
        if (index === 0) row.classList.add('selected');
        
        row.innerHTML = `
            <td class="description">${bond.description}</td>
            <td>${bond.isin}</td>
            <td>${bond.res}</td>
            <td>${bond.maturity}</td>
            <td>${bond.resDays}</td>
            <td>${bond.ccy}</td>
            <td class="bid-value">${bond.bidYield}</td>
            <td class="bid-value">${bond.bidPrice}</td>
            <td class="mid-value">${bond.midPrice}</td>
            <td class="mid-value">${bond.midYield}</td>
            <td class="ask-value">${bond.askPrice}</td>
        `;
        
        row.addEventListener('click', function() {
            document.querySelectorAll('#bondTableBody tr').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
        });
        
        tbody.appendChild(row);
    });
}

// Populate Dealer Pricing Table
function populateDealerTable() {
    const tbody = document.getElementById('dealerTableBody');
    tbody.innerHTML = '';
    
    mockDealerPricing.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="time-col">${row.bidTime}</td>
            <td class="dealer-col">${row.dealer}</td>
            <td>${row.bidAxe}</td>
            <td>${row.bidSize}</td>
            <td class="bid-val">${row.bidYield}</td>
            <td class="bid-val">${row.bidPrice}</td>
            <td class="ask-val">${row.askYield}</td>
            <td class="ask-val">${row.askPrice}</td>
            <td>${row.askSize}</td>
            <td>${row.askAxe}</td>
            <td class="dealer-col">${row.dealerAsk}</td>
            <td class="time-col">${row.askTime}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Simulate live price updates
function updatePrices() {
    const rows = document.querySelectorAll('#bondTableBody tr');
    rows.forEach(row => {
        const bidPriceCell = row.cells[7];
        const askPriceCell = row.cells[10];
        
        if (Math.random() > 0.7) {
            const currentBidPrice = parseFloat(bidPriceCell.textContent);
            const change = (Math.random() - 0.5) * 0.02;
            bidPriceCell.textContent = (currentBidPrice + change).toFixed(5);
            
            const currentAskPrice = parseFloat(askPriceCell.textContent);
            askPriceCell.textContent = (currentAskPrice + change).toFixed(5);
        }
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    populateBondTable();
    populateDealerTable();
    
    // Update prices every 2 seconds
    setInterval(updatePrices, 2000);
});
