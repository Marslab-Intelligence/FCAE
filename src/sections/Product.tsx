const products = [
  {
    title: 'Accounts',
    description: 'FDIC-insured checking and savings. API-first. Built for speed.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 14h12" />
      </svg>
    ),
  },
  {
    title: 'Cards',
    description: 'Issue virtual and physical cards instantly. Controls at the transaction level.',
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
    title: 'Treasury',
    description: 'Earn yield on idle cash. T-bills, money market, and laddered portfolios.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        <path d="M7 17a3 3 0 0 1 6 0" />
      </svg>
    ),
  },
]

export default function Product() {
  return (
    <section id="product" className="bg-(--color-onyx-canvas)" aria-labelledby="product-heading">
      <div className="section-container">
        <header className="text-center max-w-[720px] mx-auto mb-16">
          <h2 id="product-heading" className="text-heading-lg font-(--font-arcadiadisplay) text-(--color-ivory-text) mb-6">
            Three primitives. One platform.
          </h2>
          <p className="text-body-lg text-(--color-ash-text)">
            Every financial tool a startup needs, built on a single API. Compose them however you work.
          </p>
        </header>

        <div className="grid-3" role="list">
          {products.map((product) => (
            <article key={product.title} className="card-graphite flex flex-col" role="listitem">
              <div className="text-(--color-ivory-text) mb-6" aria-hidden="true">
                {product.icon}
              </div>
              <h3 className="text-heading-sm font-(--font-arcadiadisplay) text-(--color-ivory-text) mb-4">
                {product.title}
              </h3>
              <p className="text-body text-(--color-ivory-text) leading-normal flex-1">
                {product.description}
              </p>
            </article>
          ))}
        </div>

        <div className="text-center mt-16">
          <a href="/products" className="btn-ghost">
            View all products
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}