import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy — SID Managed Cloud Services',
  description: 'Privacy Policy for SID Managed Cloud Services.',
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-accent text-sm font-medium mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <Shield className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl text-text">Privacy Policy</h1>
            <p className="text-text-muted text-sm">Last updated: January 2025</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-8 text-text-muted leading-relaxed">
          <div className="p-6 rounded-2xl bg-white/4 border border-white/10">
            <p>At SID Managed Cloud Services, we are committed to protecting your privacy. This policy explains how we collect, use, and safeguard your information when you use our services.</p>
          </div>

          {[
            {
              title: '1. Information We Collect',
              content: 'We collect information you provide directly to us, such as when you create an account, request a service, or contact support. This includes name, email address, company name, phone number, and billing information. We also collect technical data such as IP addresses, browser type, and usage patterns through cookies and analytics tools.',
            },
            {
              title: '2. How We Use Your Information',
              content: 'We use your information to provide, maintain, and improve our services; process transactions; send technical notices and support messages; respond to comments and questions; and send marketing communications (with your consent). We do not sell, rent, or share your personal information with third parties for their marketing purposes.',
            },
            {
              title: '3. Data Security',
              content: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data is encrypted in transit and at rest. We are ISO 27001:2022 certified and SOC 2 Type II compliant.',
            },
            {
              title: '4. Data Retention',
              content: 'We retain your personal information for as long as your account is active or as needed to provide you services. You can request deletion of your account and associated data at any time by contacting our Data Protection Officer.',
            },
            {
              title: '5. Your Rights',
              content: 'You have the right to access, correct, or delete your personal information. You may also object to or restrict processing of your data, or request data portability. To exercise these rights, contact our privacy team at privacy@sidcloud.com.',
            },
            {
              title: '6. Contact Us',
              content: 'For privacy-related questions, contact our Data Protection Officer at privacy@sidcloud.com or write to: SID Managed Cloud Services, Koramangala, Bangalore — 560034.',
            },
          ].map((section) => (
            <div key={section.title}>
              <h2 className="font-display font-bold text-xl text-text mb-3">{section.title}</h2>
              <p>{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
