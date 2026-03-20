'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/slices/authSlice';
import { MapPin, LogOut, User as UserIcon, PlusCircle } from 'lucide-react';

export default function Navbar() {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch by only rendering user-dependent UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <nav className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4 flex justify-between items-center text-white">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <MapPin className="text-blue-400" />
          <span>Trao AI</span>
        </Link>
        <div className="flex items-center gap-6">
          <div className="w-20 h-8 bg-white/5 animate-pulse rounded-full"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/20 px-6 py-4 flex justify-between items-center text-white">
      <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight">
        <MapPin className="text-blue-400" />
        <span>Trao AI</span>
      </Link>
      
      <div className="flex items-center gap-6">
        {user ? (
          <>
            <Link href="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link>
            <Link href="/create-trip" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition-all shadow-lg shadow-blue-500/20">
              <PlusCircle size={18} />
              <span>New Trip</span>
            </Link>
            <div className="flex items-center gap-4 border-l border-white/10 pl-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center">
                  <UserIcon size={16} />
                </div>
                <span className="font-medium">{user.username}</span>
              </div>
              <button 
                onClick={() => dispatch(logout())}
                className="hover:text-red-400 transition-colors p-2"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:text-blue-400 transition-colors">Login</Link>
            <Link href="/signup" className="bg-white text-slate-900 px-6 py-2 rounded-full font-semibold hover:bg-blue-50 transition-colors">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
