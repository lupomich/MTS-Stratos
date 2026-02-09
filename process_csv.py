import csv

# Leggi il CSV
csv_file = '/home/malupo/Github/Test2/BONDVISION TRADABLE INSTRUMENT 20260209 115928.csv'

bonds_by_country = {}
eu_bonds = []
total_rows = 0

print("Inizio lettura CSV...", flush=True)

try:
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            total_rows += 1
            if total_rows % 1000 == 0:
                print(f"  Elaborati {total_rows} righe...", flush=True)
            
            isin = row.get('ISIN', '').strip()
            description = row.get('DESCRIPTION', '').strip()
            country = row.get('COUNTRY', '').strip()
            maturity = row.get('MATURITY', '').strip()
            res_maturity = row.get('RESIDUAL MATURITY', '').strip()
            coupon = row.get('COUPON', '0').replace(',', '.').split(';')[0]
            ccy = row.get('CCY', '').strip()
            bond_class = row.get('CLASS', '').strip()
            product_type = row.get('PRODUCT TYPE', '').strip()
            
            if not isin or not description or not country:
                continue
            
            try:
                coupon_float = float(coupon)
            except:
                coupon_float = 0
            
            # Escape single quotes in description
            description_escaped = description.replace("'", "\\'")
            
            bond = {
                'isin': isin,
                'description': description_escaped,
                'maturity': maturity,
                'resMaturity': res_maturity,
                'coupon': coupon_float,
                'ccy': ccy,
                'class': bond_class,
                'productType': product_type
            }
            
            if country not in bonds_by_country:
                bonds_by_country[country] = []
            
            bonds_by_country[country].append(bond)
            
            # Se la descrizione inizia con "EU ", aggiungi a eu_bonds
            if description.startswith('EU '):
                eu_bonds.append(bond)

    print(f"CSV letto completamente: {total_rows} righe totali", flush=True)
    
    # Genera il codice JavaScript
    print("Generazione codice JavaScript...", flush=True)
    
    js_code = "// Real Bond Database - Generated from CSV\nexport const governmentBonds = {\n"
    
    # Aggiungi i bond per paese
    for country in sorted(bonds_by_country.keys()):
        bonds = bonds_by_country[country]
        js_code += f"  {country}: [\n"
        for bond in bonds:
            c = bond['coupon']
            js_code += f"    {{ isin: '{bond['isin']}', description: '{bond['description']}', maturity: '{bond['maturity']}', resMaturity: '{bond['resMaturity']}', coupon: {c}, ccy: '{bond['ccy']}', class: '{bond['class']}', productType: '{bond['productType']}' }},\n"
        js_code += "  ],\n"
    
    # Aggiungi i bond EU
    js_code += "  EU: [\n"
    for bond in eu_bonds:
        c = bond['coupon']
        js_code += f"    {{ isin: '{bond['isin']}', description: '{bond['description']}', maturity: '{bond['maturity']}', resMaturity: '{bond['resMaturity']}', coupon: {c}, ccy: '{bond['ccy']}', class: '{bond['class']}', productType: '{bond['productType']}' }},\n"
    js_code += "  ]\n"
    
    js_code += "}\n\n"
    
    # Aggiungi le funzioni di supporto
    js_code += """export function getRandomBonds(countryCode, count = 15) {
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
    
    # Salva il file
    output_file = '/home/malupo/Github/Test2/bondvision-digital/src/data/governmentBonds.js'
    print(f"Scrittura file {output_file}...", flush=True)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(js_code)
    
    print(f"File scritto: {output_file}")
    print(f"Paesi trovati: {len(bonds_by_country)}")
    print(f"Country codes: {sorted(bonds_by_country.keys())}")
    print(f"Bond per paese:")
    for country in sorted(bonds_by_country.keys()):
        print(f"  {country}: {len(bonds_by_country[country])} bond")
    print(f"Bond EU trovati: {len(eu_bonds)}")
    
except Exception as e:
    print(f"Errore: {e}", flush=True)
    import traceback
    traceback.print_exc()
