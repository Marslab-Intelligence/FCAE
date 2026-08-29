'use client'

const logos = [
  'Stripe', 'Vercel', 'Notion', 'Figma', 'Linear', 'Ramp',
  'Deel', 'Loom', 'Replicate', 'Anthropic', 'Scale', 'Plaid'
]

const metrics = [
  { value: '$200B+', label: 'Moved annually' },
  { value: '200K+', label: 'Companies' },
  { value: '99.99%', label: 'Uptime' },
]

export default function Proof() {
  return (
    <section id="proof" className="bg-(--color-onyx-canvas)" aria-labelledby="proof-heading">
      <div className="section-container">
        <div className="sr-only" id="proof-heading">Trusted by leading companies</div>

        <div className="logo-marquee mb-16 overflow-hidden" aria-hidden="true">
          <div className="marquee-track flex gap-12 items-center whitespace-nowrap animate-marquee">
            {logos.map((logo) => (
              <span
                key={logo}
                className="text-heading font-medium text-(--color-ivory-text) opacity-70 hover:opacity-100 transition-opacity duration-200 whitespace-nowrap"
              >
                {logo}
              </span>
            ))}
            {logos.map((logo) => (
              <span
                key={`${logo}-duplicate`}
                className="text-heading font-medium text-(--color-ivory-text) opacity-70 hover:opacity-100 transition-opacity duration-200 whitespace-nowrap"
              >
                {logo}
              </span>
            ))}
          </div>
        </div>

        <div className="grid-3 gap-8" role="list" aria-label="Key metrics">
          {metrics.map((metric) => (
            <div key={metric.value} className="relative p-10 text-center" role="listitem">
              <div className="absolute inset-0 bg-(--color-obsidian-button) rounded-(--radius-buttons)" />
              <div className="relative flex flex-col items-center">
                <div className="text-display font-(--font-arcadiadisplay) text-(--color-ivory-text) leading-tight mb-3">
                  {metric.value}
                </div>
                <div className="text-body-sm text-(--color-ash-text) uppercase tracking-wide">
                  {metric.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  )
}