// Smoke test: verify the auth flow (login -> use cookie -> logout).
// Run with: node scripts/smoke-auth.mjs
//
// Requires dev server running on localhost:3500 and bootstrap env vars set.

const BASE = 'http://localhost:3500'

const email = process.env.ADMIN_BOOTSTRAP_EMAIL
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD

if (!email || !password) {
  console.error('Set ADMIN_BOOTSTRAP_EMAIL and ADMIN_BOOTSTRAP_PASSWORD before running.')
  process.exit(1)
}

const jar = new Map()

function applyCookies(setCookieHeader) {
  if (!setCookieHeader) return
  const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]
  for (const raw of cookies) {
    const [pair] = raw.split(';')
    const [name, ...rest] = pair.split('=')
    if (!name) continue
    if (/max-age=0/i.test(raw) || /^$/i.test(rest.join('=').trim())) {
      jar.delete(name.trim())
    } else {
      jar.set(name.trim(), rest.join('=').trim())
    }
  }
}

function cookieHeader() {
  return Array.from(jar.entries()).map(([k, v]) => `${k}=${v}`).join('; ')
}

async function call(method, path, body) {
  const headers = { 'content-type': 'application/json' }
  const cookie = cookieHeader()
  if (cookie) headers.cookie = cookie
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  })
  const setCookie = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : null
  applyCookies(setCookie ?? res.headers.get('set-cookie'))
  return res
}

async function main() {
  console.log('1) Login ...')
  const loginRes = await call('POST', '/api/admin/login', { email, password })
  const loginBody = await loginRes.json().catch(() => ({}))
  console.log('   status:', loginRes.status, 'body:', loginBody)

  console.log('2) Cookie jar:', Array.from(jar.keys()))

  console.log('3) Use cookie on /api/admin/domains ...')
  const domainsRes = await call('GET', '/api/admin/domains?limit=2')
  const domainsBody = await domainsRes.json().catch(() => ({}))
  console.log('   status:', domainsRes.status, 'total:', domainsBody.total)

  console.log('4) Logout ...')
  const logoutRes = await call('POST', '/api/admin/logout')
  console.log('   status:', logoutRes.status, 'cookies after:', Array.from(jar.keys()))

  console.log('5) After logout: should be 401 ...')
  const afterRes = await call('GET', '/api/admin/domains?limit=2')
  console.log('   status:', afterRes.status)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
