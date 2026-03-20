'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import api from '@/api/apiConfig';
import Link from 'next/link';
import { Calendar, MapPin, Plus, ArrowRight, Compass, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ConfirmModal } from '@/components/FeedbackModals';

interface Itinerary {
  _id: string;
  destination: string;
  days: number;
  budget: number;
  currency: string;
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
          <h1 className="text-4xl font-bold text-white mb-2">Welcome, {user?.username}</h1>
          <p className="text-slate-400">Discover your past adventures and plan new ones.</p>
        </div>
        <Link href="/create-trip" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span>Plan New Trip</span>
        </Link>
      </div>

      {itineraries.length === 0 ? (
        <div className="premium-card p-12 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <Compass className="text-slate-500" size={40} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No trips found</h3>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            You haven't created any itineraries yet. Let's plan your first adventure together!
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
        message="Are you sure you want to delete this itinerary? This action cannot be undone."
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}

function TripCard({ trip, onDelete }: { trip: Itinerary; onDelete: (e: React.MouseEvent) => void }) {
  return (
    <Link href={`/itinerary/${trip._id}`} className="premium-card p-6 block hover:-translate-y-1 transition-all group relative">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
          <MapPin size={24} />
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-slate-500 font-medium mb-2">{new Date(trip.createdAt).toLocaleDateString()}</span>
          <button 
            onClick={onDelete}
            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
            title="Delete Itinerary"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-4">{trip.destination}</h3>
      
      <div className="flex items-center gap-4 text-slate-400 text-sm mb-6">
        <div className="flex items-center gap-1">
          <Calendar size={14} className="text-slate-500" />
          <span>{trip.days} Days</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-blue-400 font-semibold">{getCurrencySymbol(trip.currency)}</span>
          <span className="font-medium text-slate-300">Budget: {trip.budget}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold group-hover:gap-3 transition-all">
        <span>View Itinerary</span>
        <ArrowRight size={16} />
      </div>
    </Link>
  );
}
