'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { updateUser } from '@/redux/slices/authSlice';
import { User, Mail, Shield, Save, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage() {
  const { user, token } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-4xl font-black tracking-tight mb-4">Access Denied</h1>
        <p className="text-slate-500">Please login to view your profile.</p>
      </div>
    );
  }

  const isGoogle = user.provider === 'google';

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGoogle) return;
    
    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username,
          ...(password && { password })
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      dispatch(updateUser(data.user));
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-12"
      >
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                <User size={24} />
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-[var(--foreground)]">My Profile</h1>
            </div>
            <p className="text-slate-500 font-medium text-lg ml-1">Manage your identity and security settings.</p>
          </div>

          <div className="flex items-center gap-4 bg-[var(--card-bg)] p-1.5 rounded-full border border-white/5 shadow-2xl">
            <div className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest ${
              isGoogle ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
            }`}>
              <Shield size={14} />
              {user.provider} Account
            </div>
          </div>
        </header>

        <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Account Overview */}
          <div className="lg:col-span-4 space-y-8">
            <div className="premium-card p-8 text-center relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
              <div className="w-20 h-20 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 mx-auto mb-6 group-hover:scale-105 transition-transform">
                <User size={40} />
              </div>
              <h2 className="text-xl font-black tracking-tight text-[var(--foreground)] mb-1 uppercase">{user.username}</h2>
              <p className="text-slate-500 font-bold text-[10px] tracking-widest uppercase mb-4 opacity-70">Explorer</p>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <Mail size={12} />
                {user.email}
              </div>
            </div>

            {isGoogle && (
              <div className="bg-blue-500/5 border border-blue-500/10 p-8 rounded-[2rem] relative">
                <div className="absolute -top-3 left-8 px-4 py-1 bg-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white">Managed</div>
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-blue-400 uppercase text-xs tracking-widest mb-2">Google Linked</h4>
                    <p className="text-sm text-blue-400/70 font-medium leading-relaxed">
                      Your profile information is securely managed by Google. Manual updates are disabled to maintain synchronization.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Detailed Forms */}
          <div className="lg:col-span-8 space-y-10">
            {/* Personal Details Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 text-slate-400 mb-2">
                <div className="h-px bg-white/5 flex-1" />
                <span className="text-[10px] font-black uppercase tracking-widest">Personal Details</span>
                <div className="h-px bg-white/5 flex-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email <span className="opacity-50">(Primary)</span></label>
                  <div className="relative group">
                    <input 
                      type="email" 
                      value={user.email} 
                      readOnly 
                      className="w-full bg-black/40 border border-white/5 px-6 py-4 rounded-3xl text-slate-500 font-bold cursor-not-allowed outline-none"
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600">
                      <Lock size={18} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isGoogle}
                    className={`w-full bg-white/5 border px-6 py-4 rounded-3xl text-[var(--foreground)] font-black transition-all outline-none focus:ring-2 focus:ring-blue-500/50 ${
                      isGoogle ? 'border-transparent text-slate-600 cursor-not-allowed' : 'border-white/10 hover:border-white/20'
                    }`}
                  />
                </div>
              </div>
            </section>

            {/* Security Section (Conditional) */}
            {!isGoogle && (
              <section className="space-y-6">
                <div className="flex items-center gap-4 text-slate-400 mb-2">
                  <div className="h-px bg-white/5 flex-1" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Security & Password</span>
                  <div className="h-px bg-white/5 flex-1" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Password</label>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-3xl text-[var(--foreground)] font-black transition-all outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/20"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-3xl text-[var(--foreground)] font-black transition-all outline-none focus:ring-2 focus:ring-blue-500/50 hover:border-white/20"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Status Messages */}
            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex items-center gap-4 p-6 rounded-[2rem] font-black text-sm relative overflow-hidden ${
                    message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                  }`}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-current opacity-50" />
                  {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                  <div>
                    <p className="uppercase tracking-widest text-[10px] opacity-70 mb-0.5">{message.type}</p>
                    <p className="text-base">{message.text}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            {!isGoogle && (
              <div className="pt-6 flex justify-center">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full sm:w-auto px-8 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-base transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={20} />
                      SAVE ALL CHANGES
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
