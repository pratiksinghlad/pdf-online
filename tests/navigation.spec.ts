import { test, expect } from '@playwright/test';

test.describe('PDF Online Navigation and Basic UI Tests', () => {
  test('should load the home page (Merge PDF) by default', async ({ page }) => {
    await page.goto('');
    await expect(page).toHaveTitle(/PDF Online/i);
    
    // Check if the Merge PDF page header/component is visible
    const mergeHeader = page.getByRole('heading', { name: /Merge PDFs, Images & Text/i });
    await expect(mergeHeader).toBeVisible();
  });

  test('should navigate to Image to PDF page via navbar', async ({ page }) => {
    await page.goto('');
    const navLink = page.getByRole('link', { name: /Image to PDF/i });
    await navLink.click();
    
    await expect(page).toHaveURL(/.*\/image-to-pdf/);
    
    const header = page.getByRole('heading', { name: /Images to PDF/i });
    await expect(header).toBeVisible();
  });

  test('should navigate to Compress PDF page via navbar', async ({ page }) => {
    await page.goto('');
    const navLink = page.getByRole('link', { name: /Compress PDF/i });
    await navLink.click();
    
    await expect(page).toHaveURL(/.*\/compress/);
    
    const header = page.getByRole('heading', { name: /Compress PDF/i });
    await expect(header).toBeVisible();
  });

  test('should load protect/encrypt page directly', async ({ page }) => {
    await page.goto('encrypt');
    await expect(page).toHaveURL(/.*\/encrypt/);
    
    const header = page.getByRole('heading', { name: /Password Protect PDF Files/i });
    await expect(header).toBeVisible();
  });

  test('should load unlock page directly', async ({ page }) => {
    await page.goto('unlock-pdf');
    await expect(page).toHaveURL(/.*\/unlock-pdf/);
    
    const header = page.getByRole('heading', { name: /Unlock PDF Files/i });
    await expect(header).toBeVisible();
  });

  test('should load split page directly', async ({ page }) => {
    await page.goto('split-pdf');
    await expect(page).toHaveURL(/.*\/split-pdf/);
    
    const header = page.getByRole('heading', { name: /Split PDF/i });
    await expect(header).toBeVisible();
  });

  test('should load about page directly', async ({ page }) => {
    await page.goto('about');
    await expect(page).toHaveURL(/.*\/about/);
    
    const header = page.getByRole('heading', { name: /About PDF Online/i });
    await expect(header).toBeVisible();
  });

  test('should load how it works page directly', async ({ page }) => {
    await page.goto('how-it-works');
    await expect(page).toHaveURL(/.*\/how-it-works/);
    
    const header = page.getByRole('heading', { name: /How It Works/i });
    await expect(header).toBeVisible();
  });

  test('should load organize page directly', async ({ page }) => {
    await page.goto('organize');
    await expect(page).toHaveURL(/.*\/organize/);
    
    const header = page.getByRole('heading', { name: /Organize & Rotate PDF/i });
    await expect(header).toBeVisible();
  });

  test('should load pdf to image page directly', async ({ page }) => {
    await page.goto('pdf-to-image');
    await expect(page).toHaveURL(/.*\/pdf-to-image/);
    
    const header = page.getByRole('heading', { name: /PDF to Image/i });
    await expect(header).toBeVisible();
  });
});
