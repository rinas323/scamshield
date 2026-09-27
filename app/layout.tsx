import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { getThemeClass } from '@/lib/theme'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { APP_NAME } from '@/lib/config'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: APP_NAME, template: `%s · ${APP_NAME}` },
  description: 'Track and avoid fake job & internship scams across India. Report, review, and upvote suspicious listings.',
  keywords: ['scam', 'job scam', 'fake job', 'internship', 'India', 'cybercrime'],
  metadataBase: new URL('http://localhost:3000'),
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const themeClass = await getThemeClass()
  return (
    <html lang="en" className={themeClass} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-white text-slate-900 anti-aliased dark:bg-slate-950 dark:text-slate-100 flex flex-col`}
      >
        <Navbar />
        <main className="container mx-auto flex-1 px-4 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
