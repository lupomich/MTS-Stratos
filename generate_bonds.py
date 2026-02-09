import csv
import json

csv_file = '/home/malupo/Github/Test2/BONDVISION TRADABLE INSTRUMENT 20260209 115928.csv'

bonds_by_country = {}
eu_bonds = []

print("Lettura CSV...")
with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        isin = row.get('ISIN', '').strip()
        description = row.get('DESCRIPTION', '').strip()
        country = row.get('COUNTRY', '').strip()
        maturity = row.get('MATURITY', '').strip()
        res_maturity = row.get('RESIDUAL MATURITY', '').strip()
        coupon_str = row.get('COUPON', '0').replace(',', '.').split(';')[0]
        ccy = row.get('CCY', '').strip()
        bond_class = row.get('CLASS', '').strip()
        product_type = row.get('PRODUCT TYPE', '').strip()
        
        if not isin or not description or not country:
            continue
        
        # Filtra solo Government Bonds, tranne per bond EU che hanno "Supras and Agencies"
        is_eu_bond = description.startswith('EU ')
        if product_type != 'Government Bonds' and not is_eu_bond:
            continue
        
        try:
            coupon = float(coupon_str)
        except:
            coupon = 0
        
        # Escape single quotes in description
        description_safe = description.replace("'", "\\'")
        
        bond = {
            'isin': isin,
            'description': description_safe,
            'maturity': maturity,
            'resMaturity': res_maturity,
            'coupon': coupon,
            'ccy': ccy,
            'class': bond_class,
            'productType': product_type
        }
        
        if country not in bonds_by_country:
            bonds_by_country[country] = []
        
        bonds_by_country[country].append(bond)
        
        # Aggiungi al tab EU se la descrizione inizia con "EU "
        if description.startswith('EU '):
            if 'EU' not in bonds_by_country:
                bonds_by_country['EU'] = []
            bonds_by_country['EU'].append(bond)

print(f"CSV letto: {len(bonds_by_country)} paesi, {len(eu_bonds)} bond EU")

# Genera il codice JavaScript con chiavi quotate
js_code = "// Real Bond Database - Generated from CSV\nexport const governmentBonds = {\n"

# Non aggiungere EU nel sorted loop, lo aggiungeremo alla fine
for country in sorted(bonds_by_country.keys()):
    if country == 'EU':
        continue  # Salta EU, lo aggiungeremo alla fine
    
    bonds = bonds_by_country[country]
    # Usa double quotes se contiene apostrofi, single quotes altrimenti
    if "'" in country:
        js_code += f'  "{country}": [\n'
    else:
        js_code += f"  '{country}': [\n"
    for bond in bonds:
        c = bond['coupon']
        js_code += f"    {{ isin: '{bond['isin']}', description: '{bond['description']}', maturity: '{bond['maturity']}', resMaturity: '{bond['resMaturity']}', coupon: {c}, ccy: '{bond['ccy']}', class: '{bond['class']}', productType: '{bond['productType']}' }},\n"
    js_code += "  ],\n"

# Aggiungi EU al fine (solo se presente)
if 'EU' in bonds_by_country:
    js_code += "  'EU': [\n"
    for bond in bonds_by_country['EU']:
        c = bond['coupon']
        js_code += f"    {{ isin: '{bond['isin']}', description: '{bond['description']}', maturity: '{bond['maturity']}', resMaturity: '{bond['resMaturity']}', coupon: {c}, ccy: '{bond['ccy']}', class: '{bond['class']}', productType: '{bond['productType']}' }},\n"
    js_code += "  ]\n"

js_code += "}\n\n"

# Aggiungi funzioni supporto
js_code += """export const countryCodeMap = {
  'AT': 'AUSTRIA',
  'BE': 'BELGIUM',
  'BG': 'BULGARIA',
  'HR': 'CROATIA',
  'CY': 'CYPRUS',
  'CZ': 'CZECH REPUBLIC',
  'DK': 'DENMARK',
  'EE': 'ESTONIA',
  'FI': 'FINLAND',
  'FR': 'FRANCE',
  'DE': 'GERMANY',
  'GR': 'GREECE',
  'HU': 'HUNGARY',
  'IE': 'IRELAND',
  'IT': 'ITALY',
  'LV': 'LATVIA',
  'LT': 'LITHUANIA',
  'LU': 'LUXEMBOURG',
  'MT': 'MALTA',
  'NL': 'NETHERLANDS',
  'PL': 'POLAND',
  'PT': 'PORTUGAL',
  'RO': 'ROMANIA',
  'SK': 'SLOVAKIA',
  'SI': 'SLOVENIA',
  'ES': 'SPAIN',
  'SE': 'SWEDEN',
  'NO': 'NORWAY',
  'CH': 'SWITZERLAND',
  'GB': 'UNITED KINGDOM',
  'IS': 'ICELAND',
  'US': 'UNITED STATES',
  'CA': 'CANADA',
  'AU': 'AUSTRALIA',
  'JP': 'JAPAN',
  'NZ': 'NEW ZEALAND',
  'SG': 'SINGAPORE',
  'HK': 'HONG KONG',
  'CN': 'CHINA',
  'IN': 'INDIA',
  'BR': 'BRAZIL',
  'MX': 'MEXICO',
  'AR': 'ARGENTINA',
  'TR': 'TURKEY',
  'SA': 'SAUDI ARABIA',
  'AE': 'UNITED ARAB EMIRATES',
  'IL': 'ISRAEL',
  'KR': 'KOREA, REPUBLIC OF',
  'EU': 'EU'
}

export function getCountryName(countryCode) {
  return countryCodeMap[countryCode] || countryCode
}

export function getRandomBonds(countryCode, count = 15) {
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
"""

print(f"Scrittura file...")
output_file = '/home/malupo/Github/Test2/bondvision-digital/src/data/governmentBonds.js'
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(js_code)

print(f"✅ File generato: {output_file}")
print(f"   Paesi: {len(bonds_by_country)}")
print(f"   Bond EU: {len(eu_bonds)}")
