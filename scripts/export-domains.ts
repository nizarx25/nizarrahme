// Temporary script: export all domains from the dev DB to src/data/domains.json
// Run with: node --import tsx/esm scripts/export-domains.ts
import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'

const db = new PrismaClient()

async function main() {
  const domains = await db.domain.findMany({ orderBy: { createdAt: 'desc' } })
  writeFileSync('src/data/domains.json', JSON.stringify(domains, null, 2) + '\n')
  console.log(`Exported ${domains.length} domains to src/data/domains.json`)
  const wholesale = domains.filter((d) => d.sourceMarketplace === 'Wholesale')
  console.log(`Wholesale count: ${wholesale.length}`)
  await db.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
