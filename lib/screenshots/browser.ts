import { chromium, Browser, Page } from 'playwright-core';

let browserInstance: Browser | null = null;

const MAX_SCREENSHOT_HEIGHT = parseInt(process.env.PLAYWRIGHT_MAX_SCREENSHOT_HEIGHT || '10000', 10);
const NAVIGATION_TIMEOUT = parseInt(process.env.PLAYWRIGHT_TIMEOUT || '30000', 10);

// Detect if we're in a serverless environment (Vercel, AWS Lambda, etc.)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

/**
 * Get or create browser instance
 * For Vercel: Install Chrome via buildCommand in vercel.json
 */
export async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    try {
      const launchOptions: any = {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      };

      // On Vercel, use system Chrome if available
      if (isServerless) {
        launchOptions.args.push('--single-process');
        // Vercel will have Chrome at this path after install
        const vercelChromePath = '/usr/bin/google-chrome-stable';
        if (require('fs').existsSync(vercelChromePath)) {
          launchOptions.executablePath = vercelChromePath;
        }
      }

      browserInstance = await chromium.launch(launchOptions);
    } catch (error) {
      console.error('Failed to launch browser:', error);
      throw new Error('Browser initialization failed. Screenshots are unavailable.');
    }
  }
  return browserInstance;
}

/**
 * Close browser instance
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Create a new page with common settings
 */
export async function createPage(browser: Browser): Promise<Page> {
  const page = await browser.newPage();
  
  // Set reasonable timeouts
  page.setDefaultTimeout(NAVIGATION_TIMEOUT);
  page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT);

  return page;
}

/**
 * Navigate to URL with safety checks
 */
export async function navigateToUrl(
  page: Page,
  url: string,
  options?: {
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  }
): Promise<void> {
  try {
    await page.goto(url, {
      waitUntil: options?.waitUntil || 'networkidle',
      timeout: NAVIGATION_TIMEOUT,
    });
  } catch (error) {
    // If networkidle fails, try with just load
    if (options?.waitUntil === 'networkidle') {
      await page.goto(url, {
        waitUntil: 'load',
        timeout: NAVIGATION_TIMEOUT,
      });
    } else {
      throw error;
    }
  }
}

/**
 * Wait for page to be ready
 */
export async function waitForPageReady(page: Page): Promise<void> {
  // Wait for DOM to be ready
  await page.waitForLoadState('domcontentloaded');
  
  // Give a moment for JavaScript to execute
  await page.waitForTimeout(1000);
  
  // Try to wait for network to be idle, but don't fail if it times out
  try {
    await page.waitForLoadState('networkidle', { timeout: 5000 });
  } catch {
    // Network might not go idle, that's okay
  }
}

/**
 * Get the maximum safe screenshot height
 */
export function getMaxScreenshotHeight(): number {
  return MAX_SCREENSHOT_HEIGHT;
}

/**
 * Cleanup function to be called when done
 */
process.on('beforeExit', () => {
  if (browserInstance) {
    browserInstance.close().catch(() => {});
  }
});
