const fs = require('fs');
const path = require('path');

// Leggi il CSV
const csvFile = path.join(__dirname, 'BONDVISION TRADABLE INSTRUMENT 20260209 115928.csv');
const csvContent = fs.readFileSync(csvFile, 'utf-8');

// Parsa il CSV manualmente
const lines = csvContent.split('\n');
const headers = lines[0].split(',').map(h => h.trim());

// Indici delle colonne
const isinIdx = headers.indexOf('ISIN');
const descIdx = headers.indexOf('DESCRIPTION');
const countryIdx = headers.indexOf('COUNTRY');
const maturityIdx = headers.indexOf('MATURITY');
const resMaturityIdx = headers.indexOf('RESIDUAL MATURITY');
const couponIdx = headers.indexOf('COUPON');
const ccyIdx = headers.indexOf('CCY');
const classIdx = headers.indexOf('CLASS');
const productTypeIdx = headers.indexOf('PRODUCT TYPE');

console.log('Indici trovati:', {
  isin: isinIdx,
  description: descIdx,
  country: countryIdx,
  maturity: maturityIdx,
  resMaturity: resMaturityIdx,
  coupon: couponIdx,
  ccy: ccyIdx,
  class: classIdx,
  productType: productTypeIdx
});

// Raggruppa i bond per paese
const bondsByCountry = {};

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  const fields = line.split(',');
  
  const isin = fields[isinIdx]?.trim();
  const description = fields[descIdx]?.trim();
  const country = fields[countryIdx]?.trim();
  const maturity = fields[maturityIdx]?.trim();
  const resMaturity = fields[resMaturityIdx]?.trim();
  const coupon = parseFloat(fields[couponIdx]?.replace(',', '.')) || 0;
  const ccy = fields[ccyIdx]?.trim();
  const bondClass = fields[classIdx]?.trim();
  const productType = fields[productTypeIdx]?.trim();

  if (!isin || !description || !country) continue;

  const bond = {
    isin,
    description,
    maturity,
    resMaturity,
    coupon,
    ccy,
    class: bondClass,
    productType
  };

  if (!bondsByCountry[country]) {
    bondsByCountry[country] = [];
  }
  bondsByCountry[country].push(bond);
}

// Seleziona i bond EU (DESCRIPTION inizia con "EU ")
const euBonds = [];
for (const country in bondsByCountry) {
  const bonds = bondsByCountry[country];
  const euFiltered = bonds.filter(b => b.description.startsWith('EU '));
  euBonds.push(...euFiltered);
}

console.log('Paesi trovati:', Object.keys(bondsByCountry).length);
console.log('Bond EU trovati:', euBonds.length);

// Genera il codice JavaScript
let jsCode = `// Real Bond Database - Generated from CSV
export const governmentBonds = {
`;

// Aggiungi i bond per paese
const countryMapping = {};
for (const country in bondsByCountry) {
  const bonds = bondsByCountry[country];
  countryMapping[country] = bonds.length;
  
  jsCode += `  ${country}: [\n`;
  for (const bond of bonds) {
    jsCode += `    { isin: '${bond.isin}', description: '${bond.description}', maturity: '${bond.maturity}', resMaturity: '${bond.resMaturity}', coupon: ${bond.coupon}, ccy: '${bond.ccy}', class: '${bond.class}', productType: '${bond.productType}' },\n`;
  }
  jsCode += `  ],\n`;
}

// Aggiungi i bond EU
jsCode += `  EU: [\n`;
for (const bond of euBonds) {
  jsCode += `    { isin: '${bond.isin}', description: '${bond.description}', maturity: '${bond.maturity}', resMaturity: '${bond.resMaturity}', coupon: ${bond.coupon}, ccy: '${bond.ccy}', class: '${bond.class}', productType: '${bond.productType}' },\n`;
}
jsCode += `  ]\n`;

jsCode += `}\n\n`;

jsCode += `export function getRandomBonds(countryCode, count = 15) {
  const bonds = governmentBonds[countryCode] || []
  const randomCount = Math.max(Math.min(count, 30), 10)
  const shuffled = [...bonds].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(randomCount, bonds.length))
}

export function generatePriceData(bond) {
  const basePrice = 98 + Math.random() * 4
  const baseYield = 1.5 + Math.random() * 3
  
  return {
    ...bond,
    coupon: bond.coupon || 0,
    class: bond.class || 'Government Bond',
    market: 'MTS Europe',
    ccy: bond.ccy || 'EUR',
    minPrice: basePrice - Math.random() * 0.5,
    maxPrice: basePrice + Math.random() * 0.5,
    avePrice: basePrice,
    minYield: baseYield - Math.random() * 0.5,
    maxYield: baseYield + Math.random() * 0.5,
    aveYield: baseYield,
    sizeMM: Math.random() * 100,
    nominalValue: (Math.random() * 100) * 1000000,
    numTrades: Math.floor(Math.random() * 20) + 1,
    firstPrice: basePrice,
    firstYield: baseYield,
    lastPrice: basePrice + (Math.random() - 0.5) * 0.1,
    lastYield: baseYield + (Math.random() - 0.5) * 0.1,
    tradeType: 'CAT'
  }
}
`;

// Salva il file
const outputFile = path.join(__dirname, 'bondvision-digital', 'src', 'data', 'governmentBonds.js');
fs.writeFileSync(outputFile, jsCode);

console.log('File scritto:', outputFile);
console.log('Riepilogo paesi:');
console.log(countryMapping);
