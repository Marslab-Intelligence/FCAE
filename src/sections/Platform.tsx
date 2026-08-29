import Image from 'next/image'

export default function Platform() {
  return (
    <section id="platform" className="bg-(--color-onyx-canvas)" aria-labelledby="platform-heading">
      <div className="section-container">
        <div className="grid-2 gap-16 items-center">
          <div>
            <span className="inline-block px-4 py-1 text-caption text-(--color-cobalt) font-medium rounded-(--radius-tags) mb-4 bg-(--color-cobalt)/10">
              Platform
            </span>
            <h2 id="platform-heading" className="text-heading-lg font-(--font-arcadiadisplay) text-(--color-ivory-text) mb-6">
              One dashboard. Every financial move.
            </h2>
            <p className="text-body-lg text-(--color-ash-text) mb-8 max-w-[480px]">
              See cash flow, run payroll, pay vendors, move millions — without leaving Mercury.
              The dashboard is the product. Built for speed, designed for clarity.
            </p>
            <ul className="space-y-4 mb-10" role="list">
              {[
                'Real-time cash position across all accounts',
                'Approve bills and reimburse expenses in one flow',
                'Issue cards and set limits without switching tabs',
                'API-first: every action available programmatically',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-body text-(--color-ivory-text)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-(--color-cobalt) shrink-0" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            <a href="/demo" className="btn-ghost">
              See the dashboard
            </a>
          </div>

          <div className="relative card-graphite overflow-hidden" aria-hidden="true">
            <Image
              src="/dashboard-preview.jpg"
              alt="Mercury dashboard showing accounts, cards, and treasury overview"
              width={800}
              height={600}
              className="w-full h-auto object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  )
}