import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  
  // Desktop
  const desktopPage = await browser.newPage();
  await desktopPage.setViewportSize({ width: 1920, height: 1080 });
  await desktopPage.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
  const universSection = await desktopPage.locator('#univers');
  await universSection.scrollIntoViewIfNeeded();
  await universSection.screenshot({ 
    path: '/opt/cursor/artifacts/screenshots/univers-pills-fixed-local.png'
  });

  await browser.close();
  console.log('Local univers screenshot saved');
})();
