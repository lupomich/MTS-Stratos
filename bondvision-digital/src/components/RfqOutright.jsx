import React, { useState, useEffect } from 'react';
import './RfqOutright.css';

const RfqOutright = ({ bond, pricingData, onClose, onSubmit }) => {
  const [side, setSide] = useState('BUY');
  const [size, setSize] = useState('');
  const [selectedDealers, setSelectedDealers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize with default dealers (top 6)
    if (pricingData && pricingData.dealers) {
      setSelectedDealers(pricingData.dealers.slice(0, 6));
      setIsLoading(false);
    }
  }, [pricingData]);

  const toggleSide = () => {
    setSide((prevSide) => (prevSide === 'BUY' ? 'SELL' : 'BUY'));
  };

  const handleSizeChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d+(\.\d*)?$/.test(value)) {
      setSize(value);
    }
  };

  const handleDealerToggle = (dealerId) => {
    setSelectedDealers((prev) => {
      if (prev.includes(dealerId)) {
        return prev.filter((d) => d !== dealerId);
      } else {
        return [...prev, dealerId];
      }
    });
  };

  const handleSubmit = () => {
    if (!size || size === '' || parseFloat(size) <= 0) {
      setError('Please enter a valid size');
      return;
    }

    if (selectedDealers.length === 0) {
      setError('Please select at least one dealer');
      return;
    }

    const rfqData = {
      isin: bond.isin,
      description: bond.description,
      side,
      size: parseFloat(size),
      selectedDealers,
      timestamp: new Date().toISOString(),
    };

    if (onSubmit) {
      onSubmit(rfqData);
    }
    onClose();
  };

  if (isLoading) {
    return (
      <div className="rfq-outright-overlay" onClick={onClose}>
        <div className="rfq-modal" onClick={(e) => e.stopPropagation()}>
          <div className="rfq-loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="rfq-outright-overlay" onClick={onClose}>
      <div className="rfq-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="rfq-modal-header">
          <div>
            <h2 className="rfq-modal-title">RFQ OUTRIGHT</h2>
            <p className="rfq-bond-info">
              {bond.description} • {bond.isin}
            </p>
          </div>
          <button
            className="rfq-close-btn"
            onClick={onClose}
            aria-label="Close RFQ window"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="rfq-modal-body">
          {/* Error Message */}
          {error && <div className="rfq-error-message">{error}</div>}

          {/* Side & Size Section */}
          <div className="rfq-section">
            <div className="rfq-controls-grid">
              <div className="rfq-control-group">
                <label className="rfq-label">SIDE</label>
                <button
                  className={`rfq-side-toggle ${side === 'BUY' ? 'buy' : 'sell'}`}
                  onClick={toggleSide}
                >
                  {side}
                </button>
              </div>

              <div className="rfq-control-group">
                <label className="rfq-label">SIZE</label>
                <input
                  type="text"
                  className="rfq-size-input"
                  value={size}
                  onChange={handleSizeChange}
                  placeholder="Enter amount"
                  inputMode="decimal"
                />
              </div>
            </div>
          </div>

          {/* Pricing Table */}
          <div className="rfq-section">
            <h3 className="rfq-section-title">BONDVISION DEALER PRICING</h3>
            <div className="rfq-pricing-table-wrapper">
              <table className="rfq-pricing-table">
                <thead>
                  <tr>
                    <th className="rfq-table-header">Dealer</th>
                    <th className="rfq-table-header">Size</th>
                    <th className="rfq-table-header">Price</th>
                    <th className="rfq-table-header">Yield</th>
                    <th className="rfq-table-header">Spread</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingData &&
                    pricingData.dealers &&
                    pricingData.dealers.map((dealerId, index) => {
                      const pricing = pricingData.quotes[dealerId];
                      return (
                        <tr key={dealerId} className="rfq-table-row">
                          <td className="rfq-table-cell dealer-cell">
                            {dealerId}
                          </td>
                          <td className="rfq-table-cell">
                            {pricing?.size || '-'}
                          </td>
                          <td className="rfq-table-cell price-cell">
                            {pricing?.price || '-'}
                          </td>
                          <td className="rfq-table-cell">
                            {pricing?.yield || '-'}
                          </td>
                          <td
                            className={`rfq-table-cell spread-cell ${
                              side === 'BUY' ? 'bid-spread' : 'ask-spread'
                            }`}
                          >
                            {pricing?.spread || '-'}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dealer Selection */}
          <div className="rfq-section">
            <h3 className="rfq-section-title">DEALER SELECTION</h3>
            <p className="rfq-section-subtitle">
              Select dealers to send RFQ (default: top 6)
            </p>
            <div className="rfq-dealer-grid">
              {pricingData &&
                pricingData.dealers &&
                pricingData.dealers.map((dealerId) => (
                  <button
                    key={dealerId}
                    className={`rfq-dealer-btn ${
                      selectedDealers.includes(dealerId) ? 'selected' : ''
                    }`}
                    onClick={() => handleDealerToggle(dealerId)}
                  >
                    {selectedDealers.includes(dealerId) && (
                      <span className="rfq-checkmark">✓</span>
                    )}
                    {dealerId}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="rfq-modal-footer">
          <button className="rfq-btn rfq-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="rfq-btn rfq-btn-primary" onClick={handleSubmit}>
            Send RFQ
          </button>
        </div>
      </div>
    </div>
  );
};

export default RfqOutright;