'use client';

import Link from 'next/link';
import { useAppSelector } from '@/redux/hooks';
import { Sparkles, Compass, Shield, Zap, ArrowRight, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { user } = useAppSelector((state) => state.auth);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="relative isolate overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-blue-500/10 blur-[120px] rounded-full -z-10" />
      
      {/* Hero Section */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-6 py-20 sm:py-32 lg:px-8 text-center"
      >
        <motion.div variants={itemVariants} className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
            <Sparkles size={14} />
            <span>Next Gen Travel Planning</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-[var(--foreground)]">
            TRAVEL <span className="text-blue-500">SMARTER</span><br />
            WITH <span className="text-gradient">TrippieAI</span>
          </h1>
          
          <p className="text-lg sm:text-xl leading-relaxed text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto font-medium">
            Stop researching, start traveling. Our AI agent creates personalized, 
            high-end itineraries tailored to your unique vibe and budget in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link href="/dashboard" className="btn-primary w-full sm:w-auto px-10 py-4 text-lg">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/signup" className="btn-primary w-full sm:w-auto px-10 py-4 text-lg flex items-center justify-center gap-2">
                  <span>Start for Free</span>
                  <ArrowRight size={20} />
                </Link>
                <Link href="/login" className="px-10 py-4 font-bold text-[var(--foreground)] hover:text-blue-500 transition-colors">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-7xl px-6 lg:px-8 py-24 border-t border-white/5"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-[var(--foreground)] uppercase tracking-tight">Features built for <span className="text-blue-500">Adventures</span></h2>
        </div>
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard 
            icon={<Sparkles className="text-purple-400" />}
            title="AI Brain"
            description="Powered by Gemini & GPTs to analyze millions of travel spots for you."
            delay={0.1}
          />
          <FeatureCard 
            icon={<Compass className="text-blue-400" />}
            title="Hyper-Tailored"
            description="Tell us your mood, group size, and budget. We'll handle the logistics."
            delay={0.2}
          />
          <FeatureCard 
            icon={<Zap className="text-yellow-400" />}
            title="Instant Share"
            description="Invite your friends to the trip and plan your dream adventure together in real-time."
            delay={0.3}
          />
        </div>
      </motion.div>

      {/* Footer Info */}
      <div className="py-20 text-center border-t border-white/5 opacity-50">
        <div className="flex items-center justify-center gap-2 text-[var(--foreground)] font-bold mb-4">
          <MapPin size={20} className="text-blue-500" />
          <span>TrippieAI</span>
        </div>
        <p className="text-xs text-slate-500">© 2026 TrippieAI Travel Labs. All rights reserved.</p>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string, description: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="premium-card p-10 hover:border-blue-500/30 transition-all group"
    >
      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-8 border border-white/10 shadow-inner group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-2xl font-black text-[var(--foreground)] mb-4 tracking-tight uppercase">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{description}</p>
    </motion.div>
  );
}
