import { prisma } from '../lib/prisma'
import { ADMIN_EMAILS, APP_NAME } from '../lib/config'
import { ingest } from '../lib/ingestion'
import bcrypt from 'bcryptjs'

const CATEGORIES = [
  { name: 'IT / Software', slug: 'it-software', icon: '💻', description: 'Tech job scams.' },
  { name: 'Finance / Banking', slug: 'finance', icon: '🏦', description: 'Fake finance & banking offers.' },
  { name: 'E-commerce / Marketing', slug: 'ecommerce', icon: '🛒', description: 'Online earning and MLM scams.' },
  { name: 'Education', slug: 'education', icon: '🎓', description: 'Fake internships and training scams.' },
  { name: 'Customer Service', slug: 'customer-service', icon: '📞', description: 'Remote customer-service fraud.' },
  { name: 'Other', slug: 'other', icon: '❓', description: 'Miscellaneous scams.' },
]

async function main() {
  console.log(`Seeding ${APP_NAME}…`)

  // 1. Categories (upsert by slug — idempotent).
  for (const c of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon, description: c.description },
      create: { name: c.name, slug: c.slug, icon: c.icon, description: c.description },
    })
  }
  console.log(`\u2713 Seeded ${CATEGORIES.length} categories`)

  // 2. System admin (so API ingestion has an author to attribute to).
  const adminEmail = ADMIN_EMAILS[0] ?? 'admin@scamshield.local'
  const adminPassword = 'Admin@1234'
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (existing) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'ADMIN', name: existing.name ?? 'Admin' },
    })
  } else {
    const hash = await bcrypt.hash(adminPassword, 10)
    await prisma.user.create({
      data: { name: 'Admin', email: adminEmail, password: hash, role: 'ADMIN' },
    })
  }
  console.log(`\u2713 Admin account: ${adminEmail} (password: ${adminPassword})`)

  // 3. Sample / imported listings via the ingestion pipeline.
  const report = await ingest()
  console.log(
    `\u2713 Ingestion complete: ${report.created} created, ${report.skipped} skipped, ${report.scraped} scraped`
  )
  if (report.errors.length) {
    console.error('Ingest errors:')
    for (const e of report.errors) console.error('  -', e)
  }

  const counts = await prisma.scamListing.groupBy({
    by: ['status'],
    _count: true,
  })
  console.table(counts)
  console.log('Done.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
