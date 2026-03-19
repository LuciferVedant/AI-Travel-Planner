'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import axios from 'axios';
import Link from 'next/link';
import { Calendar, MapPin, DollarSign, Plus, ArrowRight, Compass } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Itinerary {
  _id: string;
  destination: string;
  days: number;
  budget: number;
  createdAt: string;
}

export default function Dashboard() {
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchItineraries = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/itineraries', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setItineraries(res.data);
      } catch (err) {
        console.error('Failed to fetch itineraries', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItineraries();
  }, [token, router]);

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
            <TripCard key={trip._id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}

function TripCard({ trip }: { trip: Itinerary }) {
  return (
    <Link href={`/itinerary/${trip._id}`} className="premium-card p-6 block hover:-translate-y-1 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
          <MapPin size={24} />
        </div>
        <span className="text-xs text-slate-500 font-medium">{new Date(trip.createdAt).toLocaleDateString()}</span>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-4">{trip.destination}</h3>
      
      <div className="flex items-center gap-4 text-slate-400 text-sm mb-6">
        <div className="flex items-center gap-1">
          <Calendar size={14} className="text-slate-500" />
          <span>{trip.days} Days</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign size={14} className="text-slate-500" />
          <span>Budget: ${trip.budget}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold group-hover:gap-3 transition-all">
        <span>View Itinerary</span>
        <ArrowRight size={16} />
      </div>
    </Link>
  );
}
