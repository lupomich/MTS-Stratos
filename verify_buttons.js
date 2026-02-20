import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3002', { waitUntil: 'networkidle' });
  
  // Aspetta che i button siano visibili
  await page.waitForSelector('.status-test', { timeout: 5000 });
  
  // Seleziona tutti i badge
  const badges = {
    test: '.status-test',
    member: '.member-status .status-badge',
    trader: '.dealer-status .status-badge',
    autoex: '.autoex-status .status-badge'
  };
  
  console.log('\n=== BUTTON MEASUREMENTS ===\n');
  
  for (const [name, selector] of Object.entries(badges)) {
    try {
      const box = await page.locator(selector).boundingBox();
      const computedStyle = await page.locator(selector).evaluate(el => {
        const style = window.getComputedStyle(el);
        return {
          width: style.width,
          height: style.height,
          padding: style.padding,
          fontSize: style.fontSize,
          lineHeight: style.lineHeight,
          display: style.display,
          alignItems: style.alignItems,
          justifyContent: style.justifyContent,
          borderRadius: style.borderRadius,
          backgroundColor: style.backgroundColor,
          color: style.color
        };
      });
      
      console.log(`${name.toUpperCase()}:`);
      console.log(`  Box: ${JSON.stringify(box)}`);
      console.log(`  Width: ${computedStyle.width}, Height: ${computedStyle.height}`);
      console.log(`  Padding: ${computedStyle.padding}`);
      console.log(`  Font: ${computedStyle.fontSize}`);
      console.log(`  LineHeight: ${computedStyle.lineHeight}`);
      console.log(`  Display: ${computedStyle.display}`);
      console.log(`  BG: ${computedStyle.backgroundColor}`);
      console.log('');
    } catch (e) {
      console.log(`${name}: ERROR - ${e.message}`);
    }
  }
  
  // Cattura screenshot della header
  const header = await page.locator('.header-info');
  await header.screenshot({ path: '/app/button_screenshot.png' });
  console.log('Screenshot salvato: button_screenshot.png');
  
  await browser.close();
})();
