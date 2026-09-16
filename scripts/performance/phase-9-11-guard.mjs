import fs from 'node:fs'
const read = p => fs.readFileSync(p, 'utf8')
const checks = []
const requireText = (file, text, why) => checks.push([read(file).includes(text), `${file}: ${why}`])
const forbid = (file, re, why) => checks.push([!re.test(read(file)), `${file}: ${why}`])

requireText('package.json', '"perf:check"', 'bundle budget command must remain available')
requireText('src/lib/endpoints/auth.api.ts', 'publicApiClient', 'auth stays same-origin BFF')
forbid('src/lib/endpoints/auth.api.ts', /NEXT_PUBLIC_API_URL|Authorization\s*:/, 'browser auth must not call Nest or attach bearer')
forbid('src/components/auth/SignInForm.tsx', /localStorage|sessionStorage/, 'auth UI must not persist tokens client-side')

const failed = checks.filter(([ok]) => !ok)
for (const [ok, msg] of checks) console.log(`${ok ? 'PASS' : 'FAIL'} ${msg}`)
if (failed.length) process.exit(1)
