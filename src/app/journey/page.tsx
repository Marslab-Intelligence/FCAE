import type { Metadata } from 'next';
import { JourneyStory } from '@/components/JourneyStory';

export const metadata: Metadata = {
  title: 'The FCAE Maturity Journey — MotionForge',
  description: 'From Foundation to Elite — a visual walkthrough of the FCAE maturity tiers and what each stage unlocks.',
};

export default function JourneyPage() {
  return <JourneyStory />;
}
