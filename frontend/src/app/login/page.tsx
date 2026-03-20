'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { setCredentials } from '@/redux/slices/authSlice';
import api from '@/api/apiConfig';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/components/NotificationProvider';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';

import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showNotification } = useNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      dispatch(setCredentials({ token: res.data.token, user: res.data.user }));
      showNotification('Welcome back to your adventure!', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Login failed. Check your vibes!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (response: any) => {
    try {
      const res = await api.post('/auth/google', { credential: response.credential });
      dispatch(setCredentials({ token: res.data.token, user: res.data.user }));
      showNotification('Successfully signed in with Google!', 'success');
      router.push('/dashboard');
    } catch (err: any) {
      showNotification('Google login failed', 'error');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] py-20 px-4 relative overflow-hidden text-[var(--foreground)]">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-blue-500/5 blur-[120px] rounded-full -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="premium-card w-full max-w-md p-8 sm:p-12 shadow-2xl border-white/5 bg-white/[0.02]"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 mb-6 mx-auto">
            <Sparkles size={32} />
          </div>
          <h2 className="text-4xl font-black mb-3 tracking-tighter text-[var(--foreground)] uppercase">Welcome <span className="text-blue-500">Back</span></h2>
          <p className="text-slate-500 font-medium">Log in to resume your journey.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <Mail size={14} />
              <span>Email Address</span>
            </label>
            <input 
              type="email" className="glass-input w-full font-bold focus:border-blue-500/50" placeholder="you@example.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <Lock size={14} />
              <span>Password</span>
            </label>
            <input 
              type="password" className="glass-input w-full font-bold focus:border-blue-500/50" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
          </div>

          <button 
            type="submit" disabled={isSubmitting} 
            className="btn-primary w-full py-4 text-lg font-black flex items-center justify-center gap-2 shadow-2xl shadow-blue-500/20 mt-4"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <>SIGN IN <ArrowRight size={20} /></>}
          </button>
        </form>

        <div className="mt-8 flex flex-col items-center gap-6">
          <div className="flex items-center gap-4 w-full text-slate-500">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-[10px] font-black uppercase tracking-widest">OR</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>
          
          <div className="w-full flex justify-center">
            <GoogleLogin 
              onSuccess={handleGoogleSuccess} 
              onError={() => showNotification('Google login failed', 'error')}
              theme="filled_black"
              shape="pill"
              size="large"
              width="320"
            />
          </div>
        </div>

        <p className="mt-10 text-center text-slate-500 text-xs font-bold uppercase tracking-wide">
          Not planned a trip yet?{' '}
          <Link href="/signup" className="text-blue-500 hover:text-blue-400 transition-colors">Create account</Link>
        </p>
      </motion.div>
    </div>
  );
}
