import React from 'react';
import { GlowCard } from './GlowCard';
import { Meteors } from './components/ui/meteors';

const PricingTier = ({
  name,
  price,
  features,
  glowColor,
  isFeatured = false,
}: {
  name: string;
  price: string;
  features: string[];
  glowColor: 'blue' | 'purple' | 'green' | 'red' | 'orange';
  isFeatured?: boolean;
}) => (
  <GlowCard
    glowColor={glowColor}
    customSize
    className={`flex flex-col p-8 text-white transition-transform duration-300 relative ${isFeatured ? 'scale-105 ring-2 ring-purple-500/50 ring-offset-4 ring-offset-gray-900' : ''}`}
  >
    {isFeatured && (
      <div className="absolute top-0 right-0 -mt-3 mr-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold text-white bg-purple-600 shadow-lg">
          Most Popular
        </span>
      </div>
    )}
    <h3 className="text-2xl font-bold mb-4">{name}</h3>
    <p className="text-4xl font-bold mb-6">
      {price}
      <span className="text-lg font-normal">/month</span>
    </p>
    <ul className="space-y-4 mb-8 grow">
      {features.map((feature, index) => (
        <li key={index} className="flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          {feature}
        </li>
      ))}
    </ul>
    <button
      className={`w-full py-3 rounded-lg font-semibold transition-colors ${
        isFeatured
          ? 'bg-purple-600 hover:bg-purple-700'
          : 'bg-gray-700 hover:bg-gray-600'
      }`}
    >
      Choose Plan
    </button>
  </GlowCard>
);

const Pricing = () => {
  const tiers = [
    {
      name: 'Basic',
      price: '$10',
      features: ['Feature A', 'Feature B', 'Feature C'],
      glowColor: 'blue' as const,
    },
    {
      name: 'Pro',
      price: '$25',
      features: ['All Basic Features', 'Feature D', 'Feature E'],
      glowColor: 'purple' as const,
      isFeatured: true,
    },
    {
      name: 'Enterprise',
      price: '$50',
      features: ['All Pro Features', '24/7 Support', 'Custom Integrations'],
      glowColor: 'green' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      <Meteors number={20} />
      <div className="relative z-10 flex flex-col items-center">
        <h2 className="text-4xl font-bold text-white mb-12">Our Pricing</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <PricingTier key={tier.name} {...tier} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;