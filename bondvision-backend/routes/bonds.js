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

// Mock pricing data with dealer quotes
const mockPricingData = {
  dealers: ['D06', 'D04', 'D09', 'D05', 'D10', 'D07', 'D02', 'D08', 'D01', 'D03'],
  quotes: {
    'D06': { size: 17, price: 98.653381, yield: 3.15, spread: 116.68 },
    'D04': { size: 12, price: 98.660805, yield: 3.1324, spread: 114.92 },
    'D09': { size: 13, price: 98.661184, yield: 3.1315, spread: 114.83 },
    'D05': { size: 15, price: 98.66207, yield: 3.1294, spread: 114.62 },
    'D10': { size: 22, price: 98.662998, yield: 3.1272, spread: 114.4 },
    'D07': { size: 15, price: 98.663842, yield: 3.1262, spread: 114.2 },
    'D02': { size: 10, price: 98.660000, yield: 3.13, spread: 115.0 },
    'D08': { size: 18, price: 98.665000, yield: 3.12, spread: 114.0 },
    'D01': { size: 20, price: 98.670000, yield: 3.11, spread: 113.0 },
    'D03': { size: 14, price: 98.655000, yield: 3.14, spread: 115.5 },
  },
};

// Endpoint to fetch RFQ data for a specific bond
router.get('/:bondId/rfq-data', (req, res) => {
  const { bondId } = req.params;

  // Log the request
  console.log(`Fetching RFQ data for bond ID: ${bondId}`);

  // Get bond data (in a real app, this would come from a database)
  const bond = mockBonds[bondId];
  
  if (!bond) {
    return res.status(404).json({ error: 'Bond not found' });
  }

  // Return pricing data with bond info
  const responseData = {
    bond,
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