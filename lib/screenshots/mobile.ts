import { BrowserContext, Page } from 'playwright';
import { getBrowser, navigateToUrl, waitForPageReady, getMaxScreenshotHeight } from './browser';
import { validateSSRF } from '../security/ssrf';

const MOBILE_VIEWPORT = {
  width: 390,
  height: 844,
};

/**
 * Capture mobile screenshot
 */
export async function captureMobileScreenshot(url: string): Promise<Buffer> {
  let page: Page | null = null;
  let context: BrowserContext | null = null;

  try {
    // Validate URL for SSRF
    const ssrfCheck = await validateSSRF(url);
    if (!ssrfCheck.safe) {
      throw new Error(ssrfCheck.reason || 'URL validation failed');
    }

    // Get browser and create page
    const browser = await getBrowser();
    context = await browser.newContext({
      viewport: MOBILE_VIEWPORT,
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      isMobile: true,
      hasTouch: true,
    });
    page = await context.newPage();

    await page.emulateMedia({ colorScheme: 'light' });

    // Navigate to URL
    await navigateToUrl(page, url, { waitUntil: 'networkidle' });

    // Wait for page to be ready
    await waitForPageReady(page);

    // Get page height, but cap it
    const bodyHandle = await page.$('body');
    const boundingBox = bodyHandle ? await bodyHandle.boundingBox() : null;
    const pageHeight = boundingBox ? Math.min(boundingBox.height, getMaxScreenshotHeight()) : MOBILE_VIEWPORT.height;

    // Take full page screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true,
      clip: pageHeight < getMaxScreenshotHeight() ? undefined : {
        x: 0,
        y: 0,
        width: MOBILE_VIEWPORT.width,
        height: pageHeight,
      },
    });

    return screenshot;
  } catch (error) {
    throw new Error(
      `Failed to capture mobile screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
    if (context) {
      await context.close().catch(() => {});
    }
  }
}

/**
 * Capture mobile screenshot with error handling
 */
export async function captureMobileScreenshotSafe(url: string): Promise<{
  success: boolean;
  data?: Buffer;
  error?: string;
}> {
  try {
    const data = await captureMobileScreenshot(url);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
