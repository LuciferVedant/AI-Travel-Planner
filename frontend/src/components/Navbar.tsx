'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { MapPin, LogOut, User as UserIcon, PlusCircle, Menu, X, Compass } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const menuVariants = {
    closed: { x: '100%', transition: { type: 'spring', stiffness: 300, damping: 30 } },
    open: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
  } as const;

  const overlayVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 }
  } as const;

  if (!mounted) {
    return (
      <nav className="fixed top-0 w-full z-50 bg-[var(--nav-bg)] backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center text-[var(--foreground)]">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <MapPin className="text-blue-400" />
          <span>TrippieAI</span>
        </Link>
        <div className="flex items-center gap-6">
          <div className="w-20 h-8 bg-white/5 animate-pulse rounded-full"></div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 w-full z-50 bg-[var(--nav-bg)] backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-4 flex justify-between items-center text-[var(--foreground)] transition-colors duration-300"
      >
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight group">
          <MapPin className="text-blue-400 group-hover:scale-110 transition-transform" />
          <span className="text-gradient">TrippieAI</span>
        </Link>
        
        <div className="flex items-center gap-3 sm:gap-6">
          <ThemeToggle />
          
          <div className="hidden lg:flex items-center gap-6">
            <AnimatePresence mode="wait">
              {user ? (
                <motion.div 
                  key="logged-in-desktop"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-6"
                >
                  <Link href="/discover" className="hover:text-blue-400 transition-colors font-medium">Discover</Link>
                  <Link href="/dashboard" className="hover:text-blue-400 transition-colors font-medium">Dashboard</Link>
                  <Link href="/create-trip" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-full transition-all shadow-lg shadow-blue-500/20 text-white font-bold text-sm">
                    <PlusCircle size={18} />
                    <span>New Trip</span>
                  </Link>
                  <div className="flex items-center gap-3 border-l border-white/10 pl-6">
                    <Link href="/profile" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white">
                        <UserIcon size={12} />
                      </div>
                      <span className="font-bold text-sm">{user.username}</span>
                    </Link>
                    <button onClick={() => dispatch(logout())} className="text-slate-400 hover:text-red-400 transition-colors p-2"><LogOut size={20} /></button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="logged-out-desktop"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-6"
                >
                  <Link href="/login" className="hover:text-blue-400 transition-colors font-medium">Login</Link>
                  <Link href="/signup" className="bg-blue-600 text-white px-8 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">Sign Up</Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={() => setIsMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-white/5 rounded-xl transition-colors border border-transparent active:border-white/10"
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial="closed" animate="open" exit="closed" variants={overlayVariants}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial="closed" animate="open" exit="closed" variants={menuVariants}
              className="fixed top-0 right-0 h-full w-[280px] sm:w-[350px] bg-[var(--background)] border-l border-white/10 z-[70] shadow-2xl p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Navigation</span>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><X size={24} /></button>
              </div>

              <div className="flex flex-col gap-6 flex-1">
                {user ? (
                  <>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 mb-4 text-center">
                      <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white mx-auto mb-4 shadow-xl">
                        <UserIcon size={32} />
                      </div>
                      <h3 className="text-xl font-black tracking-tight">{user.username}</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        {user.provider === 'google' ? 'Google Account' : 'Adventurer'}
                      </p>
                    </div>

                    <DrawerLink href="/discover" icon={<Compass size={18} />} label="Discover" onClick={() => setIsMenuOpen(false)} />
                    <DrawerLink href="/dashboard" icon={<MapPin size={18} />} label="Dashboard" onClick={() => setIsMenuOpen(false)} />
                    <DrawerLink href="/create-trip" icon={<PlusCircle size={18} />} label="New Trip" onClick={() => setIsMenuOpen(false)} highlight />
                    <DrawerLink href="/profile" icon={<UserIcon size={18} />} label="Profile" onClick={() => setIsMenuOpen(false)} />
                    
                    <button 
                      onClick={() => { dispatch(logout()); setIsMenuOpen(false); }}
                      className="mt-auto flex items-center gap-3 text-red-400 font-bold p-4 hover:bg-red-400/5 rounded-2xl transition-all"
                    >
                      <LogOut size={20} /> Logout
                    </button>
                  </>
                ) : (
                  <div className="space-y-4">
                    <DrawerLink href="/login" label="Login" onClick={() => setIsMenuOpen(false)} />
                    <Link 
                      href="/signup" onClick={() => setIsMenuOpen(false)}
                      className="flex items-center justify-center w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function DrawerLink({ href, icon, label, onClick, highlight }: any) {
  return (
    <Link 
      href={href} onClick={onClick}
      className={`flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
        highlight 
          ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' 
          : 'hover:bg-white/5 text-[var(--foreground)]'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
