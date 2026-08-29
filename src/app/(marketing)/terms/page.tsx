import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions — SID Managed Cloud Services',
  description: 'Terms and Conditions for SID Managed Cloud Services.',
};

export default function Terms() {
  return (
    <div className="min-h-screen pt-32 pb-24">
      <div className="max-w-3xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-text-muted hover:text-accent text-sm font-medium mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl text-text">Terms & Conditions</h1>
            <p className="text-text-muted text-sm">Last updated: January 2025</p>
          </div>
        </div>

        <div className="space-y-8 text-text-muted leading-relaxed">
          <div className="p-6 rounded-2xl bg-white/4 border border-white/10">
            <p>By accessing or using SID Managed Cloud Services, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.</p>
          </div>

          {[
            {
              title: '1. Service Agreement',
              content: 'SID Managed Cloud Services provides cloud management, optimization, and support services as described in your selected service tier. The specific services included are outlined in your Service Level Agreement (SLA) document provided upon engagement.',
            },
            {
              title: '2. Account Responsibilities',
              content: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access to your account. You are responsible for all activities that occur under your account.',
            },
            {
              title: '3. Billing & Payment',
              content: 'Services are billed monthly or annually based on your selected plan. Payment is due within 30 days of invoice date. Failure to pay may result in service suspension. All prices are in Indian Rupees (INR) unless otherwise specified.',
            },
            {
              title: '4. Intellectual Property',
              content: 'SID Managed Cloud retains all rights to its proprietary tools, methodologies, and documentation. You retain ownership of your data and infrastructure configurations. We may use anonymized data for service improvement purposes.',
            },
            {
              title: '5. Limitation of Liability',
              content: 'Our liability is limited to the fees paid in the 3 months preceding the claim. We are not liable for indirect, incidental, or consequential damages. Force majeure events excuse performance obligations for affected parties.',
            },
            {
              title: '6. Termination',
              content: 'Either party may terminate this agreement with 30 days written notice. We may terminate immediately for material breach. Upon termination, we will assist with data export and transition for up to 30 days.',
            },
            {
              title: '7. Governing Law',
              content: 'These terms are governed by the laws of India. Any disputes shall be resolved through arbitration in Bangalore, Karnataka, under the Indian Arbitration and Conciliation Act, 1996.',
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
