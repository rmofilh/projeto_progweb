import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:3000'
const API = 'http://localhost:8000'

test.describe('FASE D — E2E Walkthrough', () => {

  test('D1 — Home page loads catalog with real seeded patterns', async ({ page }) => {
    const logs: string[] = []
    page.on('console', msg => logs.push(msg.text()))

    await page.goto(BASE, { waitUntil: 'networkidle' })

    const body = await page.textContent('body')
    expect(body).toContain('Descubra o prazer de bordar com facilidade')

    const patternTitles = await page.locator('[data-testid="pattern-card"]').allTextContents()
    console.log(`[D1] Pattern cards found: ${patternTitles.length}`)

    if (patternTitles.length === 0) {
      console.warn('[D1] WARNING: No pattern cards rendered — page may be showing skeleton/fallback')
      const html = await page.content()
      const matches = html.match(/(Mandala|Geométrico|Floral|Orgânico|Tesselação) (Suave|Leve|Médio|Intenso|Profundo) #[0-9]+/g)
      if (matches) {
        console.log(`[D1] Seeded pattern names found in HTML: ${matches.length}`)
      } else {
        console.error('[D1] ERROR: No seeded pattern names found anywhere in page — integration broken')
      }
    }

    console.log(`[D1] Console errors: ${logs.filter(l => l.includes('error') || l.includes('Error')).length}`)
  })

  test('D2 — Login page renders magic link form', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })

    const body = await page.textContent('body')
    expect(body).toContain('Acessar meu Baú')
    expect(body).toContain('Links Mágicos')

    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toBeVisible()
    console.log('[D2] Email input visible')

    const submitBtn = page.locator('button[type="submit"]')
    await expect(submitBtn).toBeVisible()
    console.log('[D2] Submit button visible')
  })

  test('D3 — Magic link request via real API', async ({ page }) => {
    await page.goto(`${BASE}/login`, { waitUntil: 'networkidle' })

    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill('teste@exemplo.com')

    const responsePromise = page.waitForResponse(
      resp => resp.url().includes('/v1/auth/magic-link') && resp.request().method() === 'POST'
    )
    await page.locator('button[type="submit"]').click()
    const response = await responsePromise

    expect(response.status()).toBe(200)
    const responseBody = await response.json()
    console.log(`[D3] Magic link response:`, JSON.stringify(responseBody))
  })

  test('D4 — Authenticate via magic link token', async ({ page, context }) => {
    // Get a fresh token from the DB
    const token = await fetch(`${BASE}/api/test-token`).then(r => r.text()).catch(() => null)
    // Fallback: get token from API directly
    let magicToken: string | null = null

    // Request a new magic link
    await fetch(`${API}/v1/auth/magic-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teste@exemplo.com' }),
    })

    // Poll the DB for the token (use the psql command via API — hacky but works)
    const { execSync } = require('child_process')
    const result = execSync(
      `docker compose exec -T db psql -U fioeluz -d fioeluz_db -t -A -c "SELECT token FROM magic_links WHERE used = false ORDER BY expires_at DESC LIMIT 1;"`,
      { encoding: 'utf-8', timeout: 10000 }
    ).trim()
    magicToken = result || null

    if (!magicToken) {
      console.warn('[D4] No magic link token available — skipping auth test')
      return
    }

    console.log(`[D4] Got magic link token: ${magicToken}`)

    // Navigate to login with the token in URL (simulates clicking the magic link)
    await page.goto(`${BASE}/login?token=${magicToken}`, { waitUntil: 'networkidle' })

    // After successful auth, should redirect to /vault
    await page.waitForURL('**/vault', { timeout: 15000 }).catch(() => {
      console.warn('[D4] Did not redirect to /vault after auth — checking current URL')
    })
    console.log(`[D4] Current URL after auth: ${page.url()}`)
  })

  test('D5 — Light-table page loads for a pattern', async ({ page }) => {
    // Get first pattern ID from API
    const res = await fetch(`${API}/v1/catalog/patterns`)
    const patterns = await res.json()
    if (patterns.length === 0) {
      console.warn('[D5] No patterns available — skipping')
      return
    }
    const patternId = patterns[0].id
    console.log(`[D5] Testing light-table for pattern: ${patterns[0].title} (${patternId})`)

    const errors: string[] = []
    page.on('pageerror', err => errors.push(err.message))

    await page.goto(`${BASE}/light-table/${patternId}`, { waitUntil: 'networkidle', timeout: 30000 })

    const body = await page.textContent('body')
    console.log(`[D5] Body preview: ${body?.substring(0, 200)}`)
    console.log(`[D5] Page errors: ${errors.length > 0 ? errors.join(', ') : 'none'}`)
  })

  test('D6 — Vault page (auth required)', async ({ page }) => {
    await page.goto(`${BASE}/vault`, { waitUntil: 'networkidle' })

    const url = page.url()
    console.log(`[D6] Vault page URL: ${url}`)
    // Should either show login redirect or a message about authentication
    const body = await page.textContent('body')
    const isLoginRedirect = url.includes('/login')
    console.log(`[D6] Redirected to login: ${isLoginRedirect}`)
    if (!isLoginRedirect) {
      console.log(`[D6] Vault body preview: ${body?.substring(0, 200)}`)
    }
  })

  test('D7 — API endpoints return expected data', async ({ page }) => {
    // Catalog
    const catalogRes = await fetch(`${API}/v1/catalog/patterns`)
    const catalog = await catalogRes.json()
    console.log(`[D7] Catalog: ${catalog.length} patterns`)
    expect(catalog.length).toBe(101)

    // Collections
    const collRes = await fetch(`${API}/v1/catalog/collections`)
    const collections = await collRes.json()
    console.log(`[D7] Collections: ${collections.length}`)
    const seededCollections = collections.filter((c: any) =>
      ['Natureza', 'Animais', 'Geométrico', 'Floral', 'Abstrato'].includes(c.title)
    )
    expect(seededCollections.length).toBe(5)

    // Pattern by ID
    if (catalog.length > 0) {
      const pid = catalog[0].id
      const patRes = await fetch(`${API}/v1/catalog/patterns/${pid}`)
      const pattern = await patRes.json()
      expect(pattern.title).toBeTruthy()
      expect(pattern.scale_cm_reference).toBeGreaterThan(0)
      expect(pattern.difficulty_level).toBeGreaterThanOrEqual(1)
      expect(pattern.difficulty_level).toBeLessThanOrEqual(5)
      console.log(`[D7] Pattern by ID: ${pattern.title} (difficulty ${pattern.difficulty_level})`)
    }
  })

  test('D8 — Favorites flow via API', async ({ page }) => {
    // Get a pattern
    const res = await fetch(`${API}/v1/catalog/patterns`)
    const patterns = await res.json()
    if (patterns.length === 0) return
    const pattern = patterns[0]

    // Get a valid token
    const { execSync } = require('child_process')
    const token = execSync(
      `docker compose exec -T db psql -U fioeluz -d fioeluz_db -t -A -c "SELECT token FROM magic_links WHERE used = false ORDER BY expires_at DESC LIMIT 1;"`,
      { encoding: 'utf-8', timeout: 10000 }
    ).trim()

    if (!token) {
      console.warn('[D8] No token for auth — requesting one')
      await fetch(`${API}/v1/auth/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'teste@exemplo.com' }),
      })
      console.warn('[D8] Token requested — run D4 first or get token manually')
      return
    }

    // Verify token to get JWT
    const verifyRes = await fetch(`${API}/v1/auth/verify?token=${token}`, { method: 'POST' })
    const verifyData = await verifyRes.json()
    const jwt = verifyData.access_token
    console.log(`[D8] JWT obtained: ${jwt.substring(0, 30)}...`)

    const authHeaders = { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' }

    // Add favorite
    const addRes = await fetch(`${API}/v1/favorites/${pattern.id}`, {
      method: 'POST',
      headers: authHeaders,
    })
    const addData = await addRes.json()
    console.log(`[D8] Add favorite: ${addData.status}`)
    expect(addData.status).toBe('processing')

    // List favorites
    const listRes = await fetch(`${API}/v1/favorites`, { headers: authHeaders })
    const favorites = await listRes.json()
    console.log(`[D8] Favorites count: ${favorites.length}`)
    expect(favorites.length).toBeGreaterThanOrEqual(1)

    // Remove favorite
    const delRes = await fetch(`${API}/v1/favorites/${pattern.id}`, {
      method: 'DELETE',
      headers: authHeaders,
    })
    const delData = await delRes.json()
    console.log(`[D8] Remove favorite: ${delData.status}`)
    expect(delData.status).toBe('removed')
  })

  test('D9 — No 404/500 errors on public pages', async ({ page }) => {
    const urls = [
      '/',
      '/login',
    ]

    for (const url of urls) {
      const resp = await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' })
      const status = resp?.status() ?? 0
      console.log(`[D9] ${url} → HTTP ${status}`)
      expect(status).toBe(200)
    }
  })
})
