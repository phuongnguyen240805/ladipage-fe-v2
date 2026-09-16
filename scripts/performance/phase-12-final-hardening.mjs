import fs from 'node:fs'
import path from 'node:path'

const checks = []

const check = (ok, message) => checks.push([Boolean(ok), message])
const exists = file => fs.existsSync(file)
const read = file => fs.readFileSync(file, 'utf8')
const requireFile = file => check(exists(file), `${file}: required Phase 12 boundary file must exist`)
const requirePattern = (file, pattern, why) => {
  requireFile(file)
  if (exists(file)) check(pattern.test(read(file)), `${file}: ${why}`)
}
const forbidPattern = (file, pattern, why) => {
  requireFile(file)
  if (exists(file)) check(!pattern.test(read(file)), `${file}: ${why}`)
}

const packageJson = read('package.json')
check(packageJson.includes('"perf:check"'), 'package.json: production bundle budget command must remain available')
check(packageJson.includes('"build"'), 'package.json: production build command must remain available')
check(packageJson.includes('"lint"'), 'package.json: lint command must remain available')

// Same-origin auth is a release boundary: browser auth must never re-introduce direct Nest bearer calls.
const authApi = 'src/lib/endpoints/auth.api.ts'
requirePattern(authApi, /\bpublicApiClient\b/, 'browser authentication must continue through the same-origin BFF client')
forbidPattern(authApi, /NEXT_PUBLIC_API_URL|Authorization\s*:/, 'browser authentication must not call Nest directly or attach bearer credentials')

// Persistent auth state is UI metadata only. Backend/provider bearer material must stay out of Zustand/localStorage.
const authStore = 'src/features/auth/stores/auth.store.ts'
requirePattern(authStore, /sanitizePersistedFacebook/, 'provider credentials must be stripped before auth state persistence')
requirePattern(authStore, /scrubPersistedAuthStore/, 'legacy persisted auth credentials must be scrubbed in place')
if (exists(authStore)) {
  const source = read(authStore)
  const partializeStart = source.indexOf('partialize:')
  const mergeStart = partializeStart >= 0 ? source.indexOf('merge:', partializeStart) : -1
  const persistedProjection = partializeStart >= 0 && mergeStart > partializeStart
    ? source.slice(partializeStart, mergeStart)
    : ''
  check(
    /facebook:\s*sanitizePersistedFacebook\(state\.facebook\)/.test(persistedProjection),
    `${authStore}: persisted Facebook state must pass through the credential sanitizer`,
  )
  check(
    !/facebook:\s*state\.facebook/.test(persistedProjection),
    `${authStore}: raw Facebook auth state must not be persisted`,
  )
}

// Session/refresh endpoints must not serialize credentials back to browser JavaScript.
const tokenJson = /(?:NextResponse|Response)\.json\s*\(\s*(?:\{[\s\S]{0,400}\b(?:token|accessToken|refreshToken)\s*:|(?:pair|tokenPair|tokens)\b)/i
for (const route of ['src/app/api/auth/session/route.ts', 'src/app/api/auth/refresh/route.ts']) {
  forbidPattern(route, tokenJson, 'auth credential must not be returned in JSON')
}
forbidPattern('src/app/api/auth/refresh/route.ts', /export\s+async\s+function\s+GET\b|export\s+function\s+GET\b/, 'refresh/token rotation must not be state-changing GET')
requirePattern('src/app/api/auth/refresh/route.ts', /export\s+async\s+function\s+POST\b|export\s+function\s+POST\b/, 'refresh must remain a same-origin POST flow')

// The old JS cookie bridge must not be able to write auth credentials.
const sessionCookie = 'src/features/auth/utils/session-cookie.ts'
if (exists(sessionCookie)) {
  const source = read(sessionCookie)
  check(!/setCookie\(SESSION_COOKIE_NAME\s*,/.test(source), `${sessionCookie}: JavaScript must not write the Nest access cookie`)
  check(!/setCookie\(NEST_REFRESH_COOKIE_NAME\s*,/.test(source), `${sessionCookie}: JavaScript must not write the Nest refresh cookie`)
}

const educationRequest = 'src/features/education/utils/request.ts'
forbidPattern(educationRequest, /NEXT_PUBLIC_API_BASE_URL|localStorage\.getItem\(['"]access_token['"]\)|Authorization\s*=/, 'education browser API must not own upstream URL or bearer auth')
requirePattern(educationRequest, /\/api\/education\//, 'education API calls must route through the dedicated same-origin BFF')
const educationSignIn = 'src/features/education/components/auth/SignInForm.tsx'
forbidPattern(educationSignIn, /setItem\(['"](?:access_token|refresh_token|remember_password)['"]|user-token=\$\{/, 'education sign-in must not persist credentials or passwords')
requirePattern('src/app/api/education-auth/login/route.ts', /setEducationSessionCookies/, 'education login BFF must capture credentials into HttpOnly cookies')
requirePattern('src/lib/education/education-session.server.ts', /httpOnly:\s*true/, 'education session cookies must be HttpOnly')
requirePattern('src/lib/education/education-backend.server.ts', /EDUCATION_INTERNAL_URL/, 'education upstream URL must be server-owned')

// Sign-in UI must remain credential-storage agnostic.
const signIn = 'src/components/auth/SignInForm.tsx'
forbidPattern(signIn, /localStorage|sessionStorage/, 'authentication UI must not persist credentials or tokens in browser storage')
forbidPattern(signIn, /document\.cookie\s*=|Authorization\s*:/, 'authentication UI must not write auth cookies or bearer headers')

// Repository-wide backstop for common persistent-browser-secret regressions.
const sourceFiles = []
const walk = dir => {
  if (!exists(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(target)
    else if (/\.(?:ts|tsx|js|jsx)$/.test(entry.name)) sourceFiles.push(target)
  }
}
walk('src')

const persistentCredentialKey = /(?:localStorage|sessionStorage)\.setItem\(\s*['"](?:nestToken|accessToken|refreshToken|access_token|refresh_token|remember_password|tokenSet|eaag|eaab|eaai|eaah)['"]\s*,/i

for (const file of sourceFiles) {
  const source = read(file)
  check(
    !persistentCredentialKey.test(source),
    `${file}: bearer/provider credentials must not be persisted in Web Storage`,
  )
  check(
    !/NEXT_PUBLIC_[A-Z0-9_]*(?:SECRET|TOKEN|PRIVATE_KEY|API_KEY)/.test(source),
    `${file}: secrets must not be exposed through NEXT_PUBLIC_* variables`,
  )
}

const failed = checks.filter(([ok]) => !ok)
for (const [ok, message] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${message}`)
if (failed.length) {
  console.error('Phase 12 frontend failing invariants:')
  for (const [, message] of failed) console.error(`FAIL ${message}`)
  console.error(`Phase 12 frontend hardening failed: ${failed.length} invariant(s) violated.`)
  process.exit(1)
}
console.log('Phase 12 frontend hardening passed.')
