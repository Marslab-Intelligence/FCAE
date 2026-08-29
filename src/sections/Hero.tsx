'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-transparent text-white flex flex-col justify-center items-center pt-24 pb-12 text-center">
      {/* Content Container */}
      <div className="relative z-20 max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 w-full flex flex-col items-center">
        {/* Headline */}
        <h1 className="animate-blur-fade-up eos-gradient-text text-fluid-hero font-extrabold text-balance mb-4">
          Enterprise Cloud Expertise <br />
          <span className="text-[#a5f3fc] drop-shadow-[0_0_40px_rgba(165,243,252,0.8)]">
            Without Enterprise Hiring
          </span>
        </h1>

        {/* Subtitle */}
        <p className="animate-blur-fade-up text-white/85 text-fluid-body mb-8 max-w-2xl font-light">
          Your on-demand Cloud Architecture & Engineering team for AWS, Microsoft Azure, and
          Hybrid Cloud—delivered through a predictable monthly subscription.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
          <Link
            href="/plans"
            className="inline-flex items-center gap-2 bg-white text-black hover:bg-slate-100 font-bold px-7 py-3 rounded-full text-sm sm:text-base shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Explore Plans
            <ArrowRight className="w-4 h-4 text-black stroke-[2.5]" />
          </Link>

          <Link
            href="/coe"
            className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold px-7 py-3 rounded-full text-sm sm:text-base transition-all duration-200"
          >
            Talk to an Architect
          </Link>
        </div>

        {/* Certified Cloud Partner Logos */}
        <div className="animate-blur-fade-up mt-8 flex flex-col items-center w-full">
          <p className="text-[11px] sm:text-xs uppercase tracking-widest text-white/50 font-medium mb-6">
            Certified Cloud & Platform Partners
          </p>
          <div className="flex flex-row flex-nowrap items-center justify-center gap-5 sm:gap-8 md:gap-10 max-w-5xl mx-auto px-2">
            <div className="flex items-center justify-center shrink-0 hover:-translate-y-1.5 hover:scale-105 transition-all duration-300">
              <Image
                src="/test_aws_clean.png"
                alt="AWS Partner Advanced Tier"
                width={260}
                height={260}
                unoptimized
                className="h-16 sm:h-20 md:h-24 w-auto object-contain filter drop-shadow-[0_10px_20px_rgba(255,255,255,0.15)]"
              />
            </div>
            <div className="flex items-center justify-center shrink-0 hover:-translate-y-1.5 hover:scale-105 transition-all duration-300">
              <Image
                src="/ms_partner_digital.png"
                alt="Microsoft Solutions Partner - Digital & App Innovation"
                width={320}
                height={130}
                unoptimized
                className="h-16 sm:h-20 md:h-24 w-auto object-contain filter drop-shadow-[0_10px_20px_rgba(255,255,255,0.15)]"
              />
            </div>
            <div className="flex items-center justify-center shrink-0 hover:-translate-y-1.5 hover:scale-105 transition-all duration-300">
              <Image
                src="/ms_partner_infra.png"
                alt="Microsoft Solutions Partner - Infrastructure"
                width={320}
                height={130}
                unoptimized
                className="h-16 sm:h-20 md:h-24 w-auto object-contain filter drop-shadow-[0_10px_20px_rgba(255,255,255,0.15)]"
              />
            </div>
            <div className="flex items-center justify-center shrink-0 hover:-translate-y-1.5 hover:scale-105 transition-all duration-300">
              <Image
                src="/ms_partner_data_ai.png"
                alt="Microsoft Solutions Partner - Data & AI"
                width={340}
                height={130}
                unoptimized
                className="h-16 sm:h-20 md:h-24 w-auto object-contain filter drop-shadow-[0_10px_20px_rgba(255,255,255,0.15)]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
