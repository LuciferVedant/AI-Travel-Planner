'use client';

import Link from 'next/link';
import { useAppSelector } from '@/redux/hooks';
import { Sparkles, Compass, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="relative isolate overflow-hidden">
      {/* Hero Section */}
      <div className="px-6 py-24 sm:py-32 lg:px-8 text-center">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-7xl mb-6">
            Travel Smarter with <span className="text-gradient">Trao AI</span>
          </h1>
          <p className="text-lg leading-8 text-slate-400 mb-10">
            Generate complete, personalized travel itineraries in seconds using our advanced AI agent. 
            From budget planning to day-by-day activities, we've got you covered.
          </p>
          <div className="flex items-center justify-center gap-x-6">
            {user ? (
              <Link href="/dashboard" className="btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/signup" className="btn-primary">
                  Get Started for Free
                </Link>
                <Link href="/login" className="text-sm font-semibold leading-6 text-white hover:text-blue-400 transition-colors">
                  Live Demo <span aria-hidden="true">→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 border-t border-white/5">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard 
            icon={<Sparkles className="text-purple-400" />}
            title="AI-Powered"
            description="Our advanced LLM agent crafts itineraries based on your unique interests and constraints."
          />
          <FeatureCard 
            icon={<Compass className="text-blue-400" />}
            title="Personalized"
            description="Every trip is unique. Tell us your budget, duration, and interests, and we'll do the rest."
          />
          <FeatureCard 
            icon={<Zap className="text-yellow-400" />}
            title="Instant Results"
            description="No more spending hours researching. Get a full travel plan in less than 30 seconds."
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string, description: string }) {
  return (
    <div className="premium-card p-8 hover:bg-white/[0.05] transition-all">
      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
