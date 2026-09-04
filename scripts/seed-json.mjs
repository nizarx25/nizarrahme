// Wrapper that picks the right Prisma schema based on DATABASE_URL,
// generates the client, and runs the JSON seeder. Used by `npm run db:seed:json`.

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const url = process.env.DATABASE_URL ?? ''
const isPostgres = url.startsWith('postgres://') || url.startsWith('postgresql://')
const schemaPath = isPostgres
  ? 'prisma/schema.postgres.prisma'
  : 'prisma/schema.prisma'

if (!existsSync(resolve(process.cwd(), schemaPath))) {
  console.error(`[seed-json] Schema not found: ${schemaPath}`)
  process.exit(1)
}

console.log(`[seed-json] Using schema: ${schemaPath}`)

function run(cmd, args) {
  console.log(`[seed-json] > ${cmd} ${args.join(' ')}`)
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: true })
  if (result.status !== 0) {
    console.error(`[seed-json] Command failed: ${cmd} ${args.join(' ')}`)
    process.exit(result.status ?? 1)
  }
}

// Make sure the Prisma client matches the chosen schema
run('npx', ['prisma', 'generate', '--schema', schemaPath])

// Apply migrations (idempotent on Postgres via prisma migrate deploy)
if (isPostgres) {
  run('npx', ['prisma', 'db', 'push', '--accept-data-loss', '--schema', schemaPath])
} else {
  run('npx', ['prisma', 'migrate', 'deploy', '--schema', schemaPath])
}

// Run the actual seed script
run('npx', ['tsx', 'prisma/seed-from-json.ts'])

console.log('[seed-json] Done.')
