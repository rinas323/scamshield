// Scrapers plug real/external data sources into ScamShield. Each scraper returns
// normalised `IngestedListing` rows which the ingestion runner merges into the
// database as approved-but-unverified reports (flagged `isFromApi`).
//
// There is no public, free JSON API for Indian job scams, so `MockScraper`
// ships as the demo source. Point `SCRAPE_JSON_URL` at your own crawler /
// scraper API that returns the `JsonApiItem` shape below and it will be picked
// up automatically.

import { prisma } from '@/lib/prisma'
import { uniqueSlug } from '@/lib/slug'
import type { ScamType } from '@prisma/client'
import { SCAM_TYPES } from '@/lib/config'

export interface IngestedListing {
  title: string
  company?: string
  location?: string
  state?: string
  jobTitle?: string
  description: string
  scamType: ScamType
  evidence?: string[]
  externalId?: string
  sourceUrl?: string
}

export interface Scraper {
  name: string
  run(): Promise<IngestedListing[]>
}

/* ── Demo / mock data source ────────────────────────────────────────────── */
const MOCK_LISTINGS: IngestedListing[] = [
  {
    title: 'Urgent work-from-home data-entry job – pay ₹4,999 to start',
    company: 'GlobalTech Solutions',
    location: 'Delhi',
    state: 'Delhi',
    jobTitle: 'Data Entry Operator',
    description:
      'Posted on a Telegram group. They sent a fake offer letter asking for a "refundable processing fee" of ₹4,999 to activate the job. No interview, no company website.',
    scamType: 'PAYMENT_FRAUD',
    evidence: ['https://t.me/fake-globaltech-offer'],
    externalId: 'mock-1',
  },
  {
    title: 'Internship stipend of ₹25,000 – send your ID copy first',
    company: 'BrightFuture Internships',
    location: 'Mumbai',
    state: 'Maharashtra',
    jobTitle: 'Marketing Intern',
    description:
      'They reply instantly to LinkedIn posts and ask candidates to share their Aadhaar and bank details "for verification", promising a stipend that never arrives.',
    scamType: 'FAKE_JOB_POSTING',
    evidence: ['https://brightfuture-intern.com'],
    externalId: 'mock-2',
  },
  {
    title: 'Fake Infosys offer letter circulated on WhatsApp',
    company: 'Infosys Ltd',
    location: 'Bangalore',
    state: 'Karnataka',
    jobTitle: 'Software Engineer',
    description:
      'PDF offer letters mimicking Infosys HR, asking for document uploads via a Google form to "lock in" the position. Infosys has confirmed these are forged.',
    scamType: 'DOCUMENT_FRAUD',
    evidence: [],
    externalId: 'mock-3',
  },
  {
    title: 'Pay ₹9,999 for WFH franchise kit – earn ₹500/day',
    company: 'EasyCash Network',
    location: 'Chennai',
    state: 'Tamil Nadu',
    jobTitle: 'Affiliate Executive',
    description:
      'Promised ₹500/day for simple "promotional tasks". Requires buying a ₹9,999 franchise kit. Classic pyramid/fee scam.',
    scamType: 'ADVERTISING_SCAM',
    evidence: ['https://easycash-network.in'],
    externalId: 'mock-4',
  },
  {
    title: 'HR impersonator asks for OTP during "video interview"',
    company: 'TCS iON',
    location: 'Hyderabad',
    state: 'Telangana',
    jobTitle: 'Junior Executive',
    description:
      'Candidate received a call claiming to be TCS HR, scheduled a Zoom call, then asked for the mobile banking OTP "to verify salary credit".',
    scamType: 'IMPERSONATION',
    evidence: [],
    externalId: 'mock-5',
  },
  {
    title: 'Fake government job portal asking for application fees',
    company: 'Employment Portal India',
    location: 'Kolkata',
    state: 'West Bengal',
    jobTitle: 'Government Clerk',
    description:
      'A site posing as an official govt jobs portal demanding ₹1,200 application fee for a "guaranteed" position. Domain is not an official government site.',
    scamType: 'FAKE_OFFER_LETTER',
    evidence: ['https://employment-portal-india.gov.fake'],
    externalId: 'mock-6',
  },
  {
    title: 'MNC job scam via fake Naukri profile verification',
    company: 'HirePro Consultants',
    location: 'Pune',
    state: 'Maharashtra',
    jobTitle: 'Trainee Engineer',
    description:
      'They claim your Naukri profile needs a ₹1,500 "verification fee" to be shortlisted. Legit companies never charge to apply.',
    scamType: 'PAYMENT_FRAUD',
    evidence: ['https://hirepro-consultants.com'],
    externalId: 'mock-7',
  },
]

export class MockScraper implements Scraper {
  name = 'mock-demo'
  async run(): Promise<IngestedListing[]> {
    return MOCK_LISTINGS
  }
}

/* ── Generic JSON API scraper ───────────────────────────────────────────── */
export interface JsonApiItem {
  title: string
  company?: string
  location?: string
  state?: string
  jobTitle?: string
  description: string
  scamType?: string
  evidence?: string[]
  externalId?: string
  sourceUrl?: string
}

export class JsonApiScraper implements Scraper {
  name = 'json-api'
  constructor(private url: string) {}
  async run(): Promise<IngestedListing[]> {
    const res = await fetch(this.url, { next: { revalidate: 0 } })
    if (!res.ok) throw new Error(`JSON API returned ${res.status}`)
    const data = (await res.json()) as JsonApiItem[]
    const validTypes = new Set(SCAM_TYPES.map((s) => s.value))
    return data.map((item) => {
      const type = item.scamType && validTypes.has(item.scamType) ? item.scamType : 'OTHER'
      return {
        title: item.title,
        company: item.company,
        location: item.location,
        state: item.state,
        jobTitle: item.jobTitle,
        description: item.description,
        scamType: type as ScamType,
        evidence: item.evidence,
        externalId: item.externalId,
        sourceUrl: item.sourceUrl,
      }
    })
  }
}

export function scrapersForEnv(): Scraper[] {
  const scrapers: Scraper[] = [new MockScraper()]
  const jsonUrl = process.env.SCRAPE_JSON_URL
  if (jsonUrl) scrapers.push(new JsonApiScraper(jsonUrl))
  return scrapers
}

export async function ingest(): Promise<{
  scraped: number
  created: number
  skipped: number
  errors: string[]
}> {
  const scrapers = scrapersForEnv()
  const all: IngestedListing[] = []
  const errors: string[] = []

  for (const scraper of scrapers) {
    try {
      const rows = await scraper.run()
      all.push(...rows)
    } catch (e) {
      errors.push(`${scraper.name}: ${(e as Error).message}`)
    }
  }

  // Need a system submitter (an admin) to attribute API imports to.
  const adminEmail = process.env.ADMIN_EMAILS?.split(',')[0]?.trim().toLowerCase()
  let submitterId: string | null = null
  if (adminEmail) {
    const admin = await prisma.user.findUnique({ where: { email: adminEmail } })
    submitterId = admin?.id ?? null
  }

  let created = 0
  let skipped = 0
  for (const row of all) {
    const base = `${row.title}-${row.company ?? 'company'}`
    const candidate = uniqueSlug(base, row.externalId ?? `${Date.now()}-${Math.random()}`)
    const exists =
      (row.externalId &&
        (await prisma.scamListing.findFirst({ where: { externalSource: row.externalId } }))) ||
      (await prisma.scamListing.findUnique({ where: { slug: candidate } }))

    if (exists) {
      skipped++
      continue
    }

    try {
      await prisma.scamListing.create({
        data: {
          title: row.title,
          slug: candidate,
          company: row.company,
          location: row.location,
          state: row.state,
          country: 'India',
          jobTitle: row.jobTitle,
          description: row.description,
          scamType: row.scamType,
          evidence: row.evidence ?? [],
          screenshotUrls: [],
          adminDescription: row.sourceUrl
            ? `Imported from ${row.sourceUrl}. Verify before acting on this information.`
            : 'Imported from a public source. Verify before acting on this information.',
          status: 'APPROVED',
          verification: 'UNVERIFIED',
          isFromApi: true,
          externalSource: row.externalId ?? row.sourceUrl ?? row.title,
          submittedById: submitterId ?? (await createSystemSubmitter()),
        },
      })
      created++
    } catch (e) {
      errors.push(`create ${row.title}: ${(e as Error).message}`)
    }
  }

  return { scraped: all.length, created, skipped, errors }
}

async function createSystemSubmitter(): Promise<string> {
  const existing = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
  if (existing) return existing.id
  const created = await prisma.user.create({
    data: {
      name: 'System',
      email: `system-${Date.now()}@scamshield.local`,
      password: '',
      role: 'ADMIN',
    },
  })
  return created.id
}
