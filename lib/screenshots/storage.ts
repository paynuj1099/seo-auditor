import { promises as fs } from 'fs';
import path from 'path';

const STORAGE_PATH = process.env.SCREENSHOT_STORAGE_PATH || './public/screenshots';

/**
 * Ensure storage directory exists
 */
async function ensureStorageDir(): Promise<void> {
  try {
    await fs.mkdir(STORAGE_PATH, { recursive: true });
    console.log('[Storage] Screenshot directory ensured:', STORAGE_PATH);
  } catch (error) {
    console.error('[Storage] Failed to create directory:', error);
    throw error;
  }
}

/**
 * Generate unique filename for screenshot
 */
function generateFilename(auditId: string, type: 'desktop' | 'mobile'): string {
  return `${auditId}-${type}.png`;
}

/**
 * Save screenshot to local storage
 */
export async function saveScreenshotLocal(
  auditId: string,
  type: 'desktop' | 'mobile',
  data: Buffer
): Promise<string> {
  await ensureStorageDir();

  const filename = generateFilename(auditId, type);
  const filePath = path.join(STORAGE_PATH, filename);
  
  console.log(`[Storage] Saved ${type} screenshot: ${filename} (${data.length} bytes)`);

  await fs.writeFile(filePath, data);

  // Return public URL path
  return `/screenshots/${filename}`;
}

/**
 * Save both desktop and mobile screenshots
 */
export async function saveScreenshots(
  auditId: string,
  desktopData?: Buffer,
  mobileData?: Buffer
): Promise<{
  desktop?: string;
  mobile?: string;
  desktopError?: string;
  mobileError?: string;
}> {
  const result: {
    desktop?: string;
    mobile?: string;
    desktopError?: string;
    mobileError?: string;
  } = {};

  // Save desktop screenshot
  if (desktopData) {
    try {
      result.desktop = await saveScreenshotLocal(auditId, 'desktop', desktopData);
    } catch (error) {
      result.desktopError = error instanceof Error ? error.message : 'Failed to save desktop screenshot';
    }
  }

  // Save mobile screenshot
  if (mobileData) {
    try {
      result.mobile = await saveScreenshotLocal(auditId, 'mobile', mobileData);
    } catch (error) {
      result.mobileError = error instanceof Error ? error.message : 'Failed to save mobile screenshot';
    }
  }

  return result;
}

/**
 * Delete screenshot
 */
export async function deleteScreenshot(url: string): Promise<void> {
  try {
    const filename = path.basename(url);
    const filePath = path.join(STORAGE_PATH, filename);
    await fs.unlink(filePath);
  } catch {
    // Ignore errors - file might not exist
  }
}

/**
 * Production storage recommendations:
 * 
 * For production deployment, extend this module to support:
 * 
 * 1. Vercel Blob (recommended for Vercel):
 *    npm install @vercel/blob
 *    import { put } from '@vercel/blob';
 *    const { url } = await put(`${auditId}-${type}.png`, data, { access: 'public' });
 * 
 * 2. AWS S3:
 *    npm install @aws-sdk/client-s3
 *    Use S3Client.send(new PutObjectCommand(...))
 * 
 * 3. Cloudflare R2:
 *    npm install @cloudflare/workers-types
 *    Use R2 bucket API
 * 
 * Add environment variable to switch storage backend:
 * SCREENSHOT_STORAGE_BACKEND=local|vercel|s3|r2
 */
