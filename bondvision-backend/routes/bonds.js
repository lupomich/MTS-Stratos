import express from 'express';

const router = express.Router();

// Mock bond data for RFQ
const mockBonds = {
  'BOT0626': {
    isin: 'IT0006446485',
    description: 'BOT 31/0/26',
    redemptionDate: '2026-01-01',
    coupon: 0.0,
  },
  'BUND0626': {
    isin: 'DE0001141400',
    description: 'BUND 2.5 06/26',
    redemptionDate: '2026-06-04',
    coupon: 2.5,
  },
};

// Mock pricing data aligned with BondVision Dealer Pricing panel
const mockDealerPricing = [
  { dealer: 'MS', bidAxe: '2', bidSize: '5', bidYield: 0.78, bidPrice: 99.9996, askYield: 2.2301, askPrice: 99.59018, askSize: '4', askAxe: 'D03' },
  { dealer: 'UNI', bidAxe: '2', bidSize: '2.5', bidYield: 0.8147, bidPrice: 99.957, askYield: 2.2381, askPrice: 99.59166, askSize: '17', askAxe: 'D06' },
  { dealer: 'MATRIX', bidAxe: '', bidSize: '7', bidYield: 2.2407, bidPrice: 99.58082, askYield: 2.2247, askPrice: 99.59255, askSize: '15', askAxe: 'D11' },
  { dealer: '_D01', bidAxe: '', bidSize: '15', bidYield: 2.244, bidPrice: 99.58758, askYield: 2.2244, askPrice: 99.59262, askSize: '5', askAxe: 'D05' },
  { dealer: '_D02', bidAxe: '11', bidSize: '17', bidYield: 2.2462, bidPrice: 99.58728, askYield: 2.2134, askPrice: 99.59546, askSize: '7', askAxe: 'D04' },
  { dealer: '_D03', bidAxe: '22', bidSize: '', bidYield: 2.2564, bidPrice: 99.58438, askYield: 2.2132, askPrice: 99.59551, askSize: '22', askAxe: 'D10' },
  { dealer: '_D04', bidAxe: '4', bidSize: '', bidYield: 2.2566, bidPrice: 99.58432, askYield: 2.2093, askPrice: 99.59651, askSize: '15', askAxe: 'D07' },
  { dealer: '_D05', bidAxe: '5', bidSize: '15', bidYield: 2.1591, bidPrice: 99.583, askYield: 0.679, askPrice: 99.992, askSize: '', askAxe: '' },
  { dealer: '_D06', bidAxe: '15', bidSize: '', bidYield: 2.2603, bidPrice: 99.58338, askYield: 0.6528, askPrice: 99.9979, askSize: '2.5', askAxe: '' },
  { dealer: '_D07', bidAxe: '8', bidSize: '10', bidYield: 2.245, bidPrice: 99.5865, askYield: 2.218, askPrice: 99.5935, askSize: '12', askAxe: 'D12' },
  { dealer: '_D08', bidAxe: '', bidSize: '5.5', bidYield: 2.252, bidPrice: 99.585, askYield: 2.221, askPrice: 99.5928, askSize: '8', askAxe: '' },
  { dealer: '_D09', bidAxe: '6', bidSize: '20', bidYield: 2.248, bidPrice: 99.586, askYield: 2.215, askPrice: 99.5945, askSize: '18', askAxe: 'D15' },
  { dealer: '_D10', bidAxe: '12', bidSize: '9', bidYield: 2.239, bidPrice: 99.5885, askYield: 2.228, askPrice: 99.5912, askSize: '11', askAxe: 'D08' },
  { dealer: '_D11', bidAxe: '', bidSize: '14', bidYield: 2.253, bidPrice: 99.5848, askYield: 2.22, askPrice: 99.593, askSize: '16', askAxe: '' },
  { dealer: '_D12', bidAxe: '18', bidSize: '6', bidYield: 2.242, bidPrice: 99.5878, askYield: 2.226, askPrice: 99.5918, askSize: '7.5', askAxe: 'D09' },
  { dealer: '_D13', bidAxe: '9', bidSize: '12.5', bidYield: 2.247, bidPrice: 99.5868, askYield: 2.219, askPrice: 99.5938, askSize: '13', askAxe: 'D14' },
  { dealer: '_D14', bidAxe: '', bidSize: '8.5', bidYield: 2.251, bidPrice: 99.5852, askYield: 2.222, askPrice: 99.5924, askSize: '10', askAxe: '' },
  { dealer: '_D15', bidAxe: '14', bidSize: '11', bidYield: 2.244, bidPrice: 99.5872, askYield: 2.217, askPrice: 99.5942, askSize: '9', askAxe: 'D16' },
  { dealer: '_D16', bidAxe: '7', bidSize: '16', bidYield: 2.249, bidPrice: 99.5858, askYield: 2.223, askPrice: 99.592, askSize: '14', askAxe: 'D13' },
  { dealer: '_D17', bidAxe: '', bidSize: '13', bidYield: 2.246, bidPrice: 99.5869, askYield: 2.216, askPrice: 99.5948, askSize: '12', askAxe: '' },
  { dealer: '_D18', bidAxe: '10', bidSize: '7.5', bidYield: 2.25, bidPrice: 99.5854, askYield: 2.224, askPrice: 99.5915, askSize: '8.5', askAxe: 'D17' },
  { dealer: '_D19', bidAxe: '16', bidSize: '9.5', bidYield: 2.243, bidPrice: 99.588, askYield: 2.227, askPrice: 99.5908, askSize: '11.5', askAxe: 'D18' },
  { dealer: '_D20', bidAxe: '', bidSize: '18', bidYield: 2.255, bidPrice: 99.5842, askYield: 2.212, askPrice: 99.5958, askSize: '19', askAxe: '' },
  { dealer: '_D21', bidAxe: '13', bidSize: '10.5', bidYield: 2.241, bidPrice: 99.5882, askYield: 2.229, askPrice: 99.5904, askSize: '9.5', askAxe: 'D19' },
  { dealer: '_D22', bidAxe: '5', bidSize: '12', bidYield: 2.254, bidPrice: 99.5846, askYield: 2.214, askPrice: 99.5952, askSize: '13', askAxe: 'D20' }
];

const mockPricingData = {
  dealers: mockDealerPricing.map((row) => row.dealer),
  quotes: mockDealerPricing.reduce((acc, row) => {
    acc[row.dealer] = {
      bidAxe: row.bidAxe,
      bidSize: row.bidSize,
      bidYield: row.bidYield,
      bidPrice: row.bidPrice,
      askYield: row.askYield,
      askPrice: row.askPrice,
      askSize: row.askSize,
      askAxe: row.askAxe
    };
    return acc;
  }, {})
};

// Endpoint to fetch RFQ data for a specific bond
router.get('/:bondId/rfq-data', (req, res) => {
  const { bondId } = req.params;

  // Log the request
  console.log(`Fetching RFQ data for bond ISIN: ${bondId}`);

  // For demo purposes, return mock pricing data for any ISIN
  // In a real app, this would fetch bond details from database
  const responseData = {
    bond: {
      isin: bondId,
      description: `Bond ${bondId}`,
      redemptionDate: '2026-06-04',
      coupon: 2.5,
    },
    ...mockPricingData,
  };

  res.json(responseData);
});

// Endpoint to submit RFQ
router.post('/rfq/submit', (req, res) => {
  const { isin, description, side, size, selectedDealers, timestamp } = req.body;

  console.log(`RFQ Submitted:`, {
    isin,
    description,
    side,
    size,
    dealersCount: selectedDealers.length,
    dealers: selectedDealers,
    timestamp,
  });

  // In a real app, this would save to a database and send to dealers
  const rfqId = `RFQ-${Date.now()}`;

  res.json({
    success: true,
    rfqId,
    message: 'RFQ submitted successfully',
    data: {
      isin,
      description,
      side,
      size,
      selectedDealers,
    },
  });
});

export default router;