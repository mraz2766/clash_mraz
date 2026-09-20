import assert from 'node:assert/strict'
import { mkdir } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Run against pnpm web:dev; UI_PLAYWRIGHT_ROOT may point at a bundled runtime.
const require = createRequire(process.env.UI_PLAYWRIGHT_ROOT || import.meta.url)
const { chromium } = require('playwright')
const root = fileURLToPath(new URL('../../', import.meta.url)).replaceAll(
  '\\',
  '/',
)
const output = path.join(root, 'target/ui-review')
await mkdir(output, { recursive: true })
const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.UI_BROWSER,
})
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
})
const page = await context.newPage()
page.setDefaultTimeout(8000)
const errors = []
page.on('pageerror', (error) => errors.push(error.stack))
await page.route('http://127.0.0.1:3000/**', async (route) => {
  if (!route.request().isNavigationRequest()) return route.continue()
  const response = await route.fetch()
  await route.fulfill({
    response,
    body: (await response.text()).replace(
      '/main.tsx',
      `/@fs/${root}tests/ui/fixture.mjs`,
    ),
  })
})
// No fixture is allowed to send data to the internet.
await page.route(/https?:\/\/(?!127\.0\.0\.1:3000\/)/, (route) => route.abort())
const navigate = async (route = '/', theme = 'light') => {
  await page.goto(`http://127.0.0.1:3000${route}?theme=${theme}`)
  await page.locator('.desktop-workspace .base-page').waitFor()
  await page
    .locator('#initial-loading-overlay[data-hidden="true"]')
    .waitFor({ state: 'attached' })
}
try {
  await navigate()
  assert.equal(await page.locator('#home-diagnostics-panel').count(), 0)
  assert.equal(
    await page.evaluate(() => window.__uiCalls.includes('get_system_info')),
    false,
  )
  await page.getByRole('button', { name: '检查网站出口', exact: true }).click()
  await page.getByRole('textbox', { name: '网站域名' }).fill('missing.example')
  await page.getByRole('button', { name: '查看', exact: true }).click()
  assert.match(await page.getByRole('dialog').innerText(), /没有记录不代表直连/)
  await page.getByRole('button', { name: '关闭', exact: true }).click()
  await page.getByRole('dialog').waitFor({ state: 'hidden' })
  await page.keyboard.press('Control+,')
  const search = page.getByRole('textbox', {
    name: '搜索所有设置',
    exact: true,
  })
  await search.fill('UWP')
  assert.match(await page.locator('.settings-results').innerText(), /UWP 工具/)
  await page.keyboard.press('Control+1')
  assert.match(page.url(), /settings/)
  await search.fill('')
  await page.getByRole('tab', { name: '外观', exact: true }).click()
  // Persist the color preference, then verify it survives a complete reload.
  await page.getByRole('combobox').click()
  await page.getByRole('option', { name: '单色', exact: true }).click()
  assert.equal(
    await page.evaluate(() =>
      localStorage.getItem('clash.ui.traffic-color-mode'),
    ),
    'mono',
  )
  await page.reload()
  await page.getByRole('tab', { name: '外观', exact: true }).click()
  assert.match(await page.getByRole('combobox').innerText(), /单色/)
  await page.getByRole('switch', { name: '显示流量图', exact: true }).uncheck()
  await page.locator('.base-page > header').click()
  await page.keyboard.press('Control+1')
  await page.locator('.home-metrics').waitFor()
  assert.equal(await page.locator('.home-traffic').count(), 0)
  assert.match(await page.locator('.home-metrics').innerText(), /上传量/)
  // Check mode controls and native-independent keyboard behavior.
  await page.getByRole('button', { name: '全局', exact: true }).click()
  await page.waitForFunction(() => window.__uiFixture.config.mode === 'global')
  await page.getByRole('button', { name: '规则', exact: true }).click()
  await page.waitForFunction(() => window.__uiFixture.config.mode === 'rule')
  await page.keyboard.press('Control+b')
  await page.waitForFunction(
    () => window.__uiFixture.verge.collapse_navbar === true,
  )
  await page.keyboard.press('Control+b')
  await page.waitForFunction(
    () => window.__uiFixture.verge.collapse_navbar === false,
  )
  await page.locator('.diagnostics-toggle').click()
  await page.waitForFunction(() => window.__uiCalls.includes('get_system_info'))
  await page.locator('.diagnostics-toggle').click()
  assert.equal(await page.locator('#home-diagnostics-panel').count(), 0)
  await navigate('/proxies')
  await page
    .getByRole('group', { name: '节点选择', exact: true })
    .locator('button[aria-expanded]')
    .first()
    .click()
  const japan = page
    .locator('[aria-pressed]')
    .filter({ hasText: '日本 · 东京' })
    .first()
  await japan.click()
  await page.getByRole('progressbar', { name: '切换中' }).waitFor()
  await page.getByText('已切换至 日本 · 东京', { exact: true }).waitFor()
  await page.waitForFunction(
    () => window.__uiFixture.groups[0].now === '日本 · 东京',
  )
  await page.evaluate(() => {
    window.__uiFailSelection = true
  })
  await page
    .locator('[aria-pressed]')
    .filter({ hasText: '香港 · 备用' })
    .first()
    .click()
  await page.getByText('演示：节点切换失败', { exact: false }).waitFor()
  assert.equal(await japan.getAttribute('aria-pressed'), 'true')
  await page
    .getByRole('button', { name: '更多操作', exact: true })
    .first()
    .click()
  await page.getByRole('menu').waitFor()
  await page.keyboard.press('Escape')
  await page.getByRole('menu').waitFor({ state: 'hidden' })
  await page.evaluate(() =>
    localStorage.setItem('clash.ui.traffic-color-mode', 'soft'),
  )
  // Render each route at desktop and compact sizes, with both themes.
  for (const theme of ['light', 'dark']) {
    for (const width of [1280, 800]) {
      await page.setViewportSize({ width, height: width === 800 ? 600 : 900 })
      for (const route of [
        '/',
        '/proxies',
        '/profile',
        '/connections',
        '/rules',
        '/logs',
        '/unlock',
        '/settings',
      ]) {
        await navigate(route, theme)
        if (route === '/connections')
          await page
            .getByText('example.com:443', { exact: true })
            .first()
            .waitFor()
        if (route === '/')
          await page.waitForFunction(() =>
            document.querySelector('.home-traffic')?.textContent.includes('37'),
          )
        await page.screenshot({
          animations: 'disabled',
          path: path.join(
            output,
            `${route === '/' ? 'home' : route.slice(1)}-${theme}-${width}.png`,
          ),
        })
        assert.equal(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
          false,
          `overflow: ${route}, ${theme}, ${width}`,
        )
      }
    }
  }
  // High DPI and reduced motion use the same real components and isolated IPC.
  const cdp = await context.newCDPSession(page)
  await cdp.send('Emulation.setDeviceMetricsOverride', {
    width: 800,
    height: 600,
    deviceScaleFactor: 2,
    mobile: false,
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await navigate('/proxies', 'dark')
  await page.screenshot({
    animations: 'disabled',
    path: path.join(output, 'proxies-dark-hidpi.png'),
  })
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  )
  await cdp.send('Emulation.clearDeviceMetricsOverride')
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  // README screenshots show actual UI with fixture data, without development diagnostics.
  for (const theme of ['light', 'dark']) {
    await navigate('/', theme)
    await page.waitForFunction(() =>
      document.querySelector('.home-traffic')?.textContent.includes('37'),
    )
    await page.waitForFunction(
      () =>
        /数据点：[6-9]/.test(
          document.querySelector('[data-development-only]')?.textContent ?? '',
        ),
      null,
      { timeout: 15000 },
    )
    await page.addStyleTag({
      content: '[data-development-only] { display:none !important; }',
    })
    await page.screenshot({
      animations: 'disabled',
      path: path.join(root, `docs/preview_${theme}.jpg`),
      quality: 90,
    })
  }
  await navigate('/settings')
  await page.getByRole('tab', { name: '外观', exact: true }).click()
  await page.screenshot({
    animations: 'disabled',
    path: path.join(root, 'docs/preview_settings.jpg'),
    quality: 90,
  })
  await navigate()
  await page.getByRole('button', { name: '检查网站出口', exact: true }).click()
  await page.getByRole('textbox', { name: '网站域名' }).fill('example.com')
  await page.getByRole('button', { name: '查看', exact: true }).click()
  await page
    .getByRole('dialog')
    .getByText('新加坡 · 日常', { exact: false })
    .waitFor()
  await page.keyboard.press('Control+2')
  assert.doesNotMatch(page.url(), /proxies/)
  await page.addStyleTag({
    content: '[data-development-only] { display:none !important; }',
  })
  await page.screenshot({
    animations: 'disabled',
    path: path.join(root, 'docs/preview_dialog.jpg'),
    quality: 90,
  })
  assert.deepEqual(errors, [])
  console.log('UI checks passed; 32 route/theme/size screenshots:', output)
} catch (error) {
  await page.screenshot({ path: path.join(output, 'failure.png') })
  console.error('Browser errors:', errors)
  console.error(
    'Page:',
    (await page.locator('body').innerText()).slice(0, 2500),
  )
  throw error
} finally {
  await browser.close()
}
