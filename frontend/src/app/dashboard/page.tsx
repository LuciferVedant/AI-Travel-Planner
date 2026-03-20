'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import api from '@/api/apiConfig';
import Link from 'next/link';
import { Calendar, MapPin, Plus, ArrowRight, Compass, Trash2, Users, Baby, Dog } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from '@/components/FeedbackModals';

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
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥'
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
    } catch (err) {
      console.error('Failed to delete itinerary', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user?.username}</h1>
          <p className="text-slate-400">Your personalized travel portal.</p>
        </div>
        <Link href="/create-trip" className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl shadow-xl shadow-blue-500/10">
          <Plus size={20} />
          <span>Plan New Trip</span>
        </Link>
      </div>

      {itineraries.length === 0 ? (
        <div className="premium-card p-12 text-center border-dashed border-2 border-white/5">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Compass className="text-slate-500" size={40} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Adventure awaits!</h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            You haven't created any itineraries yet. Let's design your first journey today.
          </p>
          <Link href="/create-trip" className="btn-primary inline-flex">
            Start Planning
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        </div>
      )}

      <ConfirmModal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
        title="Delete Itinerary"
        message="This will permanently delete this itinerary. Are you sure?"
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}

function TripCard({ trip, onDelete }: { trip: Itinerary; onDelete: (e: React.MouseEvent) => void }) {
  const totalGuests = (trip.guests?.adults || 0) + (trip.guests?.children || 0);

  return (
    <Link href={`/itinerary/${trip._id}`} className="premium-card p-6 block hover:-translate-y-2 transition-all group relative border border-white/5 hover:border-blue-500/30">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg group-hover:shadow-blue-500/20">
          <MapPin size={24} />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">{new Date(trip.createdAt).toLocaleDateString()}</span>
          <button 
            onClick={onDelete}
            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
            title="Delete Trip"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-4 line-clamp-1 group-hover:text-blue-400 transition-colors">{trip.destination}</h3>
      
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-4 text-slate-400 text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-blue-500/60" />
            <span className="font-medium text-slate-300">{trip.days} Days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-500 font-black">{getCurrencySymbol(trip.currency)}</span>
            <span className="font-bold text-slate-300">{trip.budget}</span>
          </div>
        </div>

        {trip.guests && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
            <GuestTag icon={<Users size={12} />} count={trip.guests.adults} label="Adults" />
            {trip.guests.children > 0 && <GuestTag icon={<Baby size={12} />} count={trip.guests.children} label="Children" />}
            {trip.guests.pets > 0 && <GuestTag icon={<Dog size={12} />} count={trip.guests.pets} label="Pets" />}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider group-hover:gap-3 transition-all">
          <span>Explore Plan</span>
          <ArrowRight size={14} />
        </div>
        <div className="text-[10px] text-slate-500 font-medium">Click to view details</div>
      </div>
    </Link>
  );
}

function GuestTag({ icon, count, label }: any) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded-lg border border-white/5 text-[10px] text-slate-400 font-semibold group-hover:border-blue-500/20 transition-all">
      {icon}
      <span>{count} {label}</span>
    </div>
  );
}
