import { Page } from 'playwright';
import { getBrowser, createPage, navigateToUrl, waitForPageReady, getMaxScreenshotHeight } from './browser';
import { validateSSRF } from '../security/ssrf';

const DESKTOP_VIEWPORT = {
  width: 1440,
  height: 900,
};

/**
 * Capture desktop screenshot
 */
export async function captureDesktopScreenshot(url: string): Promise<Buffer> {
  let page: Page | null = null;

  try {
    // Validate URL for SSRF
    const ssrfCheck = await validateSSRF(url);
    if (!ssrfCheck.safe) {
      throw new Error(ssrfCheck.reason || 'URL validation failed');
    }

    // Get browser and create page
    const browser = await getBrowser();
    page = await createPage(browser);

    // Set desktop viewport
    await page.setViewportSize(DESKTOP_VIEWPORT);

    // Navigate to URL
    await navigateToUrl(page, url, { waitUntil: 'networkidle' });

    // Wait for page to be ready
    await waitForPageReady(page);

    // Get page height, but cap it
    const bodyHandle = await page.$('body');
    const boundingBox = bodyHandle ? await bodyHandle.boundingBox() : null;
    const pageHeight = boundingBox ? Math.min(boundingBox.height, getMaxScreenshotHeight()) : DESKTOP_VIEWPORT.height;

    // Take full page screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true,
      clip: pageHeight < getMaxScreenshotHeight() ? undefined : {
        x: 0,
        y: 0,
        width: DESKTOP_VIEWPORT.width,
        height: pageHeight,
      },
    });

    return screenshot;
  } catch (error) {
    throw new Error(
      `Failed to capture desktop screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
}

/**
 * Capture desktop screenshot with error handling
 */
export async function captureDesktopScreenshotSafe(url: string): Promise<{
  success: boolean;
  data?: Buffer;
  error?: string;
}> {
  try {
    const data = await captureDesktopScreenshot(url);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
