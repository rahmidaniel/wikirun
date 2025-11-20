import { expect, Page, test } from '@playwright/test';

test.describe('Smoke Tests', () => {
  const getCreateLobbyBtn = (page: Page) => page.getByRole('button', { name: 'Create Lobby' });
  const getStartGameBtn = (page: Page) => page.getByRole('button', { name: 'Start Game' });
  const getShareUrlBtn = (page: Page) => page.getByRole('button', { name: 'Invite Others' });
  const getShareUrl = (page: Page) => getShareUrlBtn(page).locator('..').locator('span.font-mono');

  const selectArticle = async (page: Page, label: 'Start' | 'End', searchTerm: string, num = 0) => {
    await page.getByLabel(label, { exact: true }).fill(searchTerm);

    await page.getByRole('listbox').waitFor({ state: 'visible' });

    await page.getByRole('option').nth(num).click();
  };

  const lobbyUrlRegex = /\/lobby\/[a-zA-Z0-9]+/;
  const gameUrlRegex = /\/game/;
  const timeout = 10000;

  test.describe('home page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

    test('displays home information', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Test your knowledge!' })).toBeVisible();

      const createLobbyButton = getCreateLobbyBtn(page);
      await expect(createLobbyButton).toBeVisible();
      await expect(createLobbyButton).toBeEnabled();
    });

    test('create a lobby and navigate to lobby page', async ({ page }) => {
      await getCreateLobbyBtn(page).click();

      await page.waitForURL(lobbyUrlRegex, { timeout });

      expect(page.url()).toMatch(lobbyUrlRegex);

      await expect(page.getByText('Game Lobby')).toBeVisible();
    });
  });

  test.describe('lobby page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await getCreateLobbyBtn(page).click();
      await page.waitForURL(lobbyUrlRegex, { timeout });
    });

    test('displays lobby information', async ({ page }) => {
      await expect(page.getByText('Players (1)')).toBeVisible();

      await expect(page.getByLabel('Start', { exact: true })).toBeVisible();
      await expect(page.getByLabel('End', { exact: true })).toBeVisible();
    });

    test('another player can join with shared url', async ({ page, browser }) => {
      const context2 = await browser.newContext();
      const page2 = await context2.newPage();

      try {
        const shareUrlElement = getShareUrl(page);
        await expect(shareUrlElement).toBeVisible({ timeout });

        const lobbyUrl = (await shareUrlElement.textContent())!;
        expect(lobbyUrl).toMatch(lobbyUrlRegex);

        await page2.goto(lobbyUrl);
        await page2.waitForURL(lobbyUrlRegex, { timeout });

        await expect(page.getByText('Players (2)')).toBeVisible({ timeout });
        await expect(page2.getByText('Players (2)')).toBeVisible({ timeout });
      } finally {
        await context2.close();
      }
    });

    test('can start game after selecting articles', async ({ page }) => {
      await selectArticle(page, 'Start', 'Japan');
      await selectArticle(page, 'End', 'Hungary');

      const startGameButton = getStartGameBtn(page);
      await expect(startGameButton).toBeEnabled({ timeout });

      await startGameButton.click();

      await page.waitForURL(gameUrlRegex, { timeout });
      expect(page.url()).toMatch(gameUrlRegex);
    });
  });

  test.describe('game page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await getCreateLobbyBtn(page).click();
      await page.waitForURL(lobbyUrlRegex, { timeout });

      await selectArticle(page, 'Start', 'Japan');
      await selectArticle(page, 'End', 'Hungary');

      await getStartGameBtn(page).click();
      await page.waitForURL(gameUrlRegex, { timeout });
    });

    test('displays article and sidebar', async ({ page }) => {
      expect(page.url()).toMatch(gameUrlRegex);

      await expect(page.locator('app-sidebar')).toBeVisible();
      await expect(page.locator('app-article-viewer')).toBeVisible();
    });
  });
});
