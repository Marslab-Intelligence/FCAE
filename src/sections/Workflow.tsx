const workflowSteps = [
  {
    title: 'Issue cards',
    description: 'Set limits, merchant categories, and auto-lock rules per card.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 10h20" />
        <path d="M2 14h20" />
        <circle cx="16" cy="12" r="2" />
      </svg>
    ),
  },
  {
    title: 'Automate AP',
    description: 'Forward an invoice. Mercury extracts, codes, and schedules payment.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    title: 'Earn yield',
    description: 'Sweep excess cash into T-bills daily. Liquidity when you need it.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        <path d="M7 17a3 3 0 0 1 6 0" />
      </svg>
    ),
  },
]

export default function Workflow() {
  return (
    <section id="workflow" className="bg-[var(--color-onyx-canvas)]" aria-labelledby="workflow-heading">
      <div className="section-container">
        <header className="text-center max-w-[720px] mx-auto mb-16">
          <h2 id="workflow-heading" className="text-heading-lg font-[var(--font-arcadiadisplay)] font-medium text-[var(--color-ivory-text)] mb-6">
            How it works
          </h2>
          <p className="text-body-lg text-[var(--color-ash-text)]">
            Three steps from signup to running your company&apos;s finances. No implementation period.
          </p>
        </header>

        <div className="grid-3" role="list">
          {workflowSteps.map((step, index) => (
            <article key={step.title} className="relative" role="listitem">
              <div className="text-[var(--color-ivory-text)] mb-4" aria-hidden="true">
                {step.icon}
              </div>
              <h3 className="text-subheading font-[var(--font-arcadiadisplay)] font-light text-[var(--color-ivory-text)] mb-3">
                {step.title}
              </h3>
              <p className="text-body text-[var(--color-ash-text)] leading-[1.5]">
                {step.description}
              </p>

              {index < workflowSteps.length - 1 && (
                <div
                  className="hidden lg:block absolute top-6 right-[-50%] w-full h-[1px] bg-[var(--color-slate-border)]"
                  aria-hidden="true"
                />
              )}
            </article>
          ))}
        </div>

        <div className="text-center mt-16">
          <a href="/get-started" className="btn-primary btn-primary--standalone">
            Get started in minutes
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}