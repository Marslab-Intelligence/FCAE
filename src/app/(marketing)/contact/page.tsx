import type { Metadata } from 'next';
import { ContactPage } from '@/sections/ContactPage';

export const metadata: Metadata = {
  title: 'Contact Us — SID Managed Cloud Services',
  description: 'Get in touch with our cloud experts. Request a consultation, demo, or enterprise pricing.',
};

export default function Contact() {
  return <ContactPage />;
}
