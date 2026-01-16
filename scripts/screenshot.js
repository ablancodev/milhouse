#!/usr/bin/env node

/**
 * screenshot.js
 * Captura screenshots usando Puppeteer
 *
 * Uso: node screenshot.js --url <url> --output <path> [--viewport <WxH>] [--selector <css>]
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function captureScreenshot(options) {
  const {
    url,
    output,
    viewport = '1920x1080',
    selector = null,
    waitForSelector = null,
    waitTime = 2000
  } = options;

  const [width, height] = viewport.split('x').map(Number);

  console.log(`[Milhouse] Capturing screenshot of ${url}`);
  console.log(`[Milhouse] Viewport: ${width}x${height}`);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({ width, height });

    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Esperar selector específico si se proporciona
    if (waitForSelector) {
      await page.waitForSelector(waitForSelector, { timeout: 10000 });
    }

    // Espera adicional para animaciones/lazy loading
    await new Promise(resolve => setTimeout(resolve, waitTime));

    // Asegurar directorio de salida existe
    const outputDir = path.dirname(output);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Capturar screenshot
    if (selector) {
      const element = await page.$(selector);
      if (!element) {
        throw new Error(`Selector "${selector}" not found on page`);
      }
      await element.screenshot({ path: output });
      console.log(`[Milhouse] Captured element "${selector}" to ${output}`);
    } else {
      await page.screenshot({
        path: output,
        fullPage: true
      });
      console.log(`[Milhouse] Captured full page to ${output}`);
    }

    return { success: true, path: output };

  } catch (error) {
    console.error(`[Milhouse] Screenshot failed: ${error.message}`);
    return { success: false, error: error.message };
  } finally {
    await browser.close();
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace('--', '');
    options[key] = args[i + 1];
  }

  if (!options.url || !options.output) {
    console.error('Usage: node screenshot.js --url <url> --output <path> [--viewport <WxH>] [--selector <css>]');
    process.exit(1);
  }

  captureScreenshot(options).then(result => {
    if (!result.success) process.exit(1);
  });
}

module.exports = { captureScreenshot };
