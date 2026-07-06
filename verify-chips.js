const { chromium } = require('playwright');
const sc = 'C:/Users/sompr/AppData/Local/Temp/claude/D---AI-Math-Tutor-Demo-AI-Math-Tutor-Demo/5ec25a3e-4fd8-41c1-9a67-1ef97bff1618/scratchpad';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  await page.goto('http://localhost:8080/?pilot=dltv');
  await page.waitForLoadState('networkidle');
  await page.locator('.btn-tutor').click();
  await page.waitForTimeout(500);

  // Turn 1 — chip แสดง + คลิก
  const chip0 = await page.locator('.chip').first().textContent();
  console.log('CHIP turn0:', chip0.trim());
  await page.screenshot({ path: `${sc}/v3-01-chip-turn0.png` });
  await page.locator('.chip').first().click();
  await page.waitForTimeout(1300);

  // Turn 2
  const chip1 = await page.locator('.chip').first().textContent();
  console.log('CHIP turn1:', chip1.trim());
  await page.locator('.chip').first().click();
  await page.waitForTimeout(1300);

  // Turn 3
  const chip2 = await page.locator('.chip').first().textContent();
  console.log('CHIP turn2:', chip2.trim());
  await page.locator('.chip').first().click();
  await page.waitForTimeout(1300);

  // Turn 4
  const chip3 = await page.locator('.chip').first().textContent();
  console.log('CHIP turn3:', chip3.trim());
  await page.screenshot({ path: `${sc}/v3-02-chip-turn3.png` });
  await page.locator('.chip').first().click();
  await page.waitForTimeout(1300);

  // หลัง turn 4 — ไม่มี chip + มีปุ่ม evidence
  const chipCount = await page.locator('.chip').count();
  const evidenceVisible = await page.locator('.btn-evidence').isVisible();
  console.log('AFTER turn4 chip count:', chipCount);
  console.log('AFTER turn4 evidence CTA:', evidenceVisible);
  await page.screenshot({ path: `${sc}/v3-03-no-chip-evidence.png` });

  // พิมพ์เองได้
  await page.locator('.btn-restart').click().catch(() => {});
  await page.locator('.btn-evidence').click().catch(() => {});
  await page.locator('.btn-restart').click().catch(async () => {
    await page.goto('http://localhost:8080/?pilot=dltv');
    await page.waitForLoadState('networkidle');
  });
  await page.locator('.btn-tutor').click();
  await page.waitForTimeout(400);
  await page.locator('.chat-input').fill('ตอบเองแบบนี้');
  await page.locator('.btn-send').click();
  await page.waitForTimeout(1300);
  const msgs = await page.locator('.msg-bubble').allTextContents();
  console.log('MANUAL send AI reply:', msgs[msgs.length-1].trim().substring(0, 80));

  await browser.close();
  console.log('DONE');
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
