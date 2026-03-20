'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useParams, useRouter } from 'next/navigation';
import api from '@/api/apiConfig';
import { MapPin, Calendar, DollarSign, ArrowLeft, Edit2, Check, X, Hotel, Map as MapIcon, Sparkles, Users, Baby, Dog, Compass, Share2 } from 'lucide-react';
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
  guests: {
    adults: number;
    children: number;
    pets: number;
  };
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
        setEditedData(res.data.itineraryData || []);
      } catch (err) {
        console.error('Failed to fetch itinerary', err);
        showNotification('Failed to load itinerary.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, [token, id, router, showNotification]);

  const handleSave = async () => {
    try {
      const res = await api.put(`/itineraries/${id}`, { itineraryData: editedData });
      setItinerary(res.data);
      setIsEditing(false);
      showNotification('Itinerary updated successfully!', 'success');
    } catch (err) {
      console.error('Failed to update itinerary', err);
      showNotification('Failed to update itinerary.', 'error');
    }
  };

  const handleActivityChange = (dayIndex: number, activityIndex: number, value: string) => {
    const newData = [...editedData];
    if (newData[dayIndex]) {
      newData[dayIndex].activities[activityIndex] = value;
      setEditedData(newData);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium animate-pulse">Loading adventure...</p>
      </div>
    </div>
  );

  if (!itinerary) return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center">
      <div className="premium-card p-12">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <X className="text-red-400" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Itinerary Not Found</h2>
        <p className="text-slate-400 mb-8">This itinerary doesn't exist or you don't have access.</p>
        <button onClick={() => router.push('/dashboard')} className="btn-primary">Return to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-10">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-all group">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
            <ArrowLeft size={18} />
          </div>
          <span className="font-medium">Dashboard</span>
        </button>
        <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-5 py-2.5 rounded-xl border border-white/10 transition-all text-sm font-semibold">
          <Share2 size={16} />
          <span>Share</span>
        </button>
      </div>

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 p-2">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold uppercase tracking-widest text-[10px]">
            <Sparkles size={12} />
            <span>AI Powered Planner</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
            {itinerary.destination}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3">
            <Badge icon={<Calendar size={14} />} label={`${itinerary.days} Days`} />
            <Badge 
              icon={<DollarSign size={14} />} 
              label={`Est. ${getCurrencySymbol(itinerary.currency)} ${itinerary.budget}`} 
              className="text-emerald-400 border-emerald-500/10 bg-emerald-500/5"
            />
            {itinerary.guests && (
              <Badge 
                icon={<Users size={14} />} 
                label={`${itinerary.guests.adults} Ad, ${itinerary.guests.children} Ch, ${itinerary.guests.pets} Pt`}
                className="text-indigo-400 border-indigo-500/10 bg-indigo-500/5"
              />
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
          {isEditing ? (
            <>
              <button 
                onClick={() => { setIsEditing(false); setEditedData(itinerary.itineraryData); }} 
                className="bg-white/5 hover:bg-white/10 text-white px-8 py-3.5 rounded-2xl flex items-center justify-center gap-2 border border-white/10 transition-all font-bold text-sm"
              >
                <X size={18} /> Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-2xl shadow-emerald-500/20 transition-all font-bold text-sm"
              >
                <Check size={18} /> Save Plan
              </button>
            </>
          ) : (
            <button 
              onClick={() => setIsEditing(true)} 
              className="btn-primary flex items-center justify-center gap-2 px-10 py-4 rounded-2xl shadow-2xl shadow-blue-500/20 font-bold text-base w-full sm:w-auto"
            >
              <Edit2 size={20} /> Edit Itinerary
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-12">
          {editedData.map((day, dIdx) => (
            <div key={dIdx} className="relative pl-12 sm:pl-16">
              {/* Vertical Connector Line */}
              {dIdx !== editedData.length - 1 && (
                <div className="absolute left-[20px] sm:left-[28px] top-14 bottom-[-48px] w-1 bg-gradient-to-b from-blue-500/30 to-transparent rounded-full" />
              )}
              
              {/* Day Number Floating */}
              <div className="absolute left-0 top-0 w-10 sm:w-14 h-10 sm:h-14 rounded-2xl bg-slate-900 border-2 border-blue-500 flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-[0_0_20px_rgba(59,130,246,0.2)] z-10 transition-transform hover:scale-110">
                {day.day}
              </div>

              <div className="premium-card p-8 sm:p-10 border-white/5 relative overflow-hidden group/day">
                {/* Background Decor */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover/day:bg-blue-500/10 transition-all" />
                
                <div className="relative z-10 mb-8">
                  {isEditing ? (
                    <input 
                      className="glass-input w-full text-2xl font-bold bg-white/5 border-white/10"
                      value={day.title}
                      onChange={(e) => {
                        const newData = [...editedData];
                        if (newData[dIdx]) {
                          newData[dIdx].title = e.target.value;
                          setEditedData(newData);
                        }
                      }}
                    />
                  ) : (
                    <h3 className="text-3xl font-bold text-white leading-tight">{day.title}</h3>
                  )}
                </div>
                
                <div className="space-y-6">
                  {day.activities.map((activity, aIdx) => (
                    <div key={aIdx} className="flex gap-6 items-start group/act">
                      <div className="mt-2.5 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] shrink-0 group-hover/act:scale-125 transition-transform" />
                      {isEditing ? (
                        <textarea 
                          className="glass-input w-full min-h-[100px] text-slate-300 focus:border-blue-500/30 bg-white/5"
                          value={activity}
                          onChange={(e) => handleActivityChange(dIdx, aIdx, e.target.value)}
                        />
                      ) : (
                        <p className="text-slate-300 leading-relaxed text-lg font-medium">{activity}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Space */}
        <aside className="lg:col-span-4 space-y-10 lg:sticky lg:top-24">
          {/* Hotel Recommendations */}
          <div className="premium-card p-8 bg-white/[0.01] border-white/5 shadow-none">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
                <Hotel size={22} />
              </div>
              <h4 className="text-xl font-bold text-white">Recommended Stays</h4>
            </div>
            
            <div className="space-y-5">
              {itinerary.hotels.map((hotel, hIdx) => (
                <div key={hIdx} className="group/hotel bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 hover:bg-white/[0.08] transition-all cursor-default">
                  <div className="font-bold text-white text-lg mb-4 group-hover/hotel:text-blue-400 transition-colors uppercase tracking-tight">{hotel.name}</div>
                  <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl">
                    <span className="text-emerald-400 font-black text-sm">{hotel.price}</span>
                    <div className="flex items-center gap-1.5 text-yellow-500">
                      <Sparkles size={14} className="fill-current" />
                      <span className="font-black text-sm">{hotel.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interests Card */}
          <div className="premium-card p-8 bg-gradient-to-br from-indigo-600/10 to-blue-600/10 border-blue-500/20">
            <div className="flex items-center gap-3 mb-6">
              <Compass className="text-blue-400" size={20} />
              <h4 className="text-lg font-bold text-white">Personalized Vibes</h4>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {itinerary.interests.map(i => (
                <span key={i} className="bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold border border-white/10 hover:bg-blue-500/20 hover:border-blue-500/30 transition-all cursor-default">
                  # {i.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          {/* Group Info Card */}
          <div className="premium-card p-8 border-white/5 text-center">
            <h4 className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-6">Traveling Group</h4>
            <div className="grid grid-cols-3 gap-4">
              <GuestStat icon={<Users size={16} />} count={itinerary.guests.adults} label="AD" />
              <GuestStat icon={<Baby size={16} />} count={itinerary.guests.children} label="CH" />
              <GuestStat icon={<Dog size={16} />} count={itinerary.guests.pets} label="PT" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function GuestStat({ icon, count, label }: { icon: any, count: number, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-2xl border border-dashed border-white/10">
      <div className="text-blue-400">{icon}</div>
      <div className="text-xl font-black text-white">{count}</div>
      <div className="text-[9px] font-bold text-slate-500">{label}</div>
    </div>
  );
}

function Badge({ icon, label, className = "" }: { icon: any, label: string, className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 bg-white/5 px-5 py-2.5 rounded-2xl border border-white/10 text-slate-300 font-bold ${className}`}>
      <span className="text-current opacity-70">{icon}</span>
      <span className="text-xs tracking-tight">{label}</span>
    </div>
  );
}
