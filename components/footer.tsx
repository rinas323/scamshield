export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 mt-auto">
      <div className="container mx-auto px-4 py-8 text-sm text-slate-500 dark:text-slate-400">
        <p>
          This site is community-driven. Reports are user-submitted and reviewed by admins
          before publication. Always verify information independently and report fraud to the
          nearest cyber-crime cell.
        </p>
        <p className="mt-2">
          Built with Next.js, Prisma + MongoDB Atlas. Not a government service.
        </p>
      </div>
    </footer>
  )
}
