'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useParams, useRouter } from 'next/navigation';
import api from '@/api/apiConfig';
import { MapPin, Calendar, DollarSign, ArrowLeft, Edit2, Check, X, Hotel, Map as MapIcon, Sparkles } from 'lucide-react';
import { useNotification } from '@/components/NotificationProvider';

interface DayPlan {
  day: number;
  title: string;
  activities: string[];
}

interface Itinerary {
  _id: string;
  destination: string;
  days: number;
  interests: string[];
  budget: number;
  currency: string;
  itineraryData: DayPlan[];
  hotels: { name: string; price: string; rating: number }[];
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

export default function ItineraryView() {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<DayPlan[]>([]);
  const { token } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchItinerary = async () => {
      if (!id) return;
      try {
        const res = await api.get(`/itineraries/${id}`);
        setItinerary(res.data);
        setEditedData(res.data.itineraryData);
      } catch (err) {
        console.error('Failed to fetch itinerary', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [token, id, router]);

  const handleSave = async () => {
    try {
      const res = await api.put(`/itineraries/${id}`, { itineraryData: editedData });
      setItinerary(res.data);
      setIsEditing(false);
      showNotification('Itinerary updated successfully!', 'success');
    } catch (err) {
      console.error('Failed to update itinerary', err);
      showNotification('Failed to update itinerary. Please try again.', 'error');
    }
  };

  const handleActivityChange = (dayIndex: number, activityIndex: number, value: string) => {
    const newData = [...editedData];
    newData[dayIndex]!.activities[activityIndex] = value;
    setEditedData(newData);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!itinerary) return <div className="p-12 text-center text-white">Itinerary not found.</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={18} />
        <span>Back to Dashboard</span>
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 text-blue-400 mb-2 font-semibold uppercase tracking-wider text-sm">
            <MapIcon size={16} />
            <span>AI-Generated Plan</span>
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-4">{itinerary.destination}</h1>
          <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              <Calendar size={14} /> {itinerary.days} Days
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10 text-blue-300">
              <Sparkles size={14} className="text-blue-400" /> 
              Budget: {getCurrencySymbol(itinerary.currency)} {itinerary.budget}
            </span>
          </div>
        </div>
        
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => { setIsEditing(false); setEditedData(itinerary.itineraryData); }} 
                className="bg-white/5 hover:bg-white/10 text-white px-6 py-2.5 rounded-full flex items-center gap-2 border border-white/10 transition-all font-medium"
              >
                <X size={18} /> Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-full flex items-center gap-2 shadow-lg shadow-green-500/20 transition-all font-medium"
              >
                <Check size={18} /> Save Changes
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="btn-primary flex items-center gap-2"
            >
              <Edit2 size={18} /> Edit Itinerary
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Itinerary */}
        <div className="lg:col-span-2 space-y-8">
          {editedData.map((day, dIdx) => (
            <div key={dIdx} className="premium-card p-8">
              <div className="flex items-center gap-4 mb-6">
                <span className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {day.day}
                </span>
                {isEditing ? (
                  <input 
                    className="glass-input flex-1 text-xl font-bold bg-white/10"
                    value={day.title}
                    onChange={(e) => {
                      const newData = [...editedData];
                      newData[dIdx]!.title = e.target.value;
                      setEditedData(newData);
                    }}
                  />
                ) : (
                  <h3 className="text-2xl font-bold text-white">{day.title}</h3>
                )}
              </div>
              
              <div className="space-y-4 ml-14">
                {day.activities.map((activity, aIdx) => (
                  <div key={aIdx} className="flex gap-4 items-start group">
                    <div className="mt-2 w-2 h-2 rounded-full bg-blue-500/40 group-hover:bg-blue-400 shrink-0" />
                    {isEditing ? (
                      <textarea 
                        className="glass-input w-full min-h-[60px] text-slate-300"
                        value={activity}
                        onChange={(e) => handleActivityChange(dIdx, aIdx, e.target.value)}
                      />
                    ) : (
                      <p className="text-slate-300 leading-relaxed">{activity}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar: Hotels & Info */}
        <div className="space-y-8">
          <div className="premium-card p-6">
            <h4 className="flex items-center gap-2 text-xl font-bold text-white mb-6">
              <Hotel className="text-blue-400" />
              <span>Recommended Hotels</span>
            </h4>
            <div className="space-y-4">
              {itinerary.hotels.map((hotel, hIdx) => (
                <div key={hIdx} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/[0.08] transition-all">
                  <div className="font-bold text-white mb-1">{hotel.name}</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-medium">{hotel.price}</span>
                    <span className="text-yellow-400 font-medium">★ {hotel.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card p-6 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border-blue-500/20">
            <h4 className="text-lg font-bold text-white mb-2">Interests Used</h4>
            <div className="flex flex-wrap gap-2">
              {itinerary.interests.map(i => (
                <span key={i} className="bg-white/5 text-slate-300 px-3 py-1 rounded-full text-xs border border-white/5">
                  {i}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
