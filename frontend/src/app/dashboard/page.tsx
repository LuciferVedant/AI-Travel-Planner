'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import api from '@/api/apiConfig';
import Link from 'next/link';
import { Calendar, MapPin, Plus, ArrowRight, Compass, Trash2, Users, Baby, Dog, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from '@/components/FeedbackModals';
import { motion, AnimatePresence } from 'framer-motion';

interface Itinerary {
  _id: string;
  destination: string;
  days: number;
  budget: number;
  currency: string;
  guests: {
    adults: number;
    children: number;
    pets: number;
  };
  createdAt: string;
}

const getCurrencySymbol = (code: string) => {
  const symbols: Record<string, string> = {
    'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥'
  };
  return symbols[code] || code;
};

export default function Dashboard() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: '' });
  const { token, user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const fetchItineraries = async () => {
    try {
      const res = await api.get('/itineraries');
      setItineraries(res.data);
    } catch (err) {
      console.error('Failed to fetch itineraries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }
    fetchItineraries();
  }, [token, router]);

  const confirmDelete = async () => {
    const id = deleteModal.id;
    try {
      await api.delete(`/itineraries/${id}`);
      setItineraries(itineraries.filter(item => item._id !== id));
      setDeleteModal({ isOpen: false, id: '' });
    } catch (err) {
      console.error('Failed to delete itinerary', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium animate-pulse">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-12"
    >
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-[var(--foreground)] tracking-tight mb-2">
            Hey, {user?.username} <span className="text-blue-500">!</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium font-sm">Where is your next adventure taking you?</p>
        </div>
        <Link href="/create-trip" className="btn-primary flex items-center gap-2 px-8 py-3.5 rounded-2xl shadow-2xl shadow-blue-500/10 w-full sm:w-auto text-center justify-center">
          <Plus size={20} />
          <span>Plan New Trip</span>
        </Link>
      </header>

      <AnimatePresence mode="popLayout">
        {itineraries.length === 0 ? (
          <motion.div 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="premium-card p-16 text-center border-dashed border-2 border-white/5 bg-white/[0.02]"
          >
            <div className="w-24 h-24 bg-blue-500/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-500/10">
              <Compass className="text-blue-500/50" size={48} />
            </div>
            <h3 className="text-2xl font-black text-[var(--foreground)] mb-3 tracking-tight">NO TRIPS YET</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-10 font-medium">
              Your travel history is empty. Use our AI to craft a unique journey today.
            </p>
            <Link href="/create-trip" className="btn-primary inline-flex px-10">
              Create First Itinerary
            </Link>
          </motion.div>
        ) : (
          <motion.div 
            initial="hidden" animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {itineraries.map((trip) => (
              <TripCard 
                key={trip._id} 
                trip={trip} 
                onDelete={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteModal({ isOpen: true, id: trip._id });
                }} 
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
        title="Delete Itinerary"
        message="This will permanently delete this itinerary. Are you sure?"
        confirmText="Delete Plan"
        isDanger={true}
      />
    </motion.div>
  );
}

function TripCard({ trip, onDelete }: { trip: Itinerary; onDelete: (e: React.MouseEvent) => void }) {
  return (
    <motion.div
      variants={{
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
      }}
      whileHover={{ y: -8 }}
      className="h-full"
    >
      <Link href={`/itinerary/${trip._id}`} className="premium-card p-7 block h-full group relative border border-white/5 hover:border-blue-500/40 transition-all shadow-xl bg-white/[0.02]">
        <div className="flex justify-between items-start mb-8">
          <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg group-hover:shadow-blue-500/30 border border-blue-500/10">
            <MapPin size={26} />
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-3 bg-white/5 px-3 py-1 rounded-full">
              {new Date(trip.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <button 
              onClick={onDelete}
              className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
              title="Delete Trip"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        
        <h3 className="text-3xl font-black text-[var(--foreground)] mb-6 line-clamp-2 tracking-tight leading-[0.9] group-hover:text-blue-500 transition-colors">
          {trip.destination.toUpperCase()}
        </h3>
        
        <div className="space-y-5 mb-10">
          <div className="flex items-center gap-5 text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
              <Calendar size={14} className="text-blue-500" />
              <span className="font-bold text-xs uppercase tracking-tight">{trip.days} Days</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 text-emerald-500">
              <span className="font-black text-xs">{getCurrencySymbol(trip.currency)}</span>
              <span className="font-black text-xs">{trip.budget}</span>
            </div>
          </div>

          {trip.guests && (
            <div className="flex flex-wrap gap-2 pt-4 border-t border-white/5">
              <GuestTag icon={<Users size={12} />} count={trip.guests.adults} label="AD" />
              {trip.guests.children > 0 && <GuestTag icon={<Baby size={12} />} count={trip.guests.children} label="CH" />}
              {trip.guests.pets > 0 && <GuestTag icon={<Dog size={12} />} count={trip.guests.pets} label="PT" />}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between pt-5 border-t border-white/5">
          <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest group-hover:gap-3 transition-all">
            <span>Dive into Plan</span>
            <ArrowRight size={14} />
          </div>
          <Sparkles size={14} className="text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
    </motion.div>
  );
}

function GuestTag({ icon, count, label }: any) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 text-[9px] text-slate-400 font-black group-hover:border-blue-500/30 transition-all uppercase tracking-tight">
      {icon}
      <span>{count} {label}</span>
    </div>
  );
}
