'use client';

import { useEffect, useState, useRef } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useParams, useRouter } from 'next/navigation';
import api from '@/api/apiConfig';
import { 
  MapPin, Calendar, DollarSign, ArrowLeft, Edit2, 
  Check, X, Hotel, Map as MapIcon, Sparkles, 
  Users, Baby, Dog, Compass, Download, Loader2 
} from 'lucide-react';
import { useNotification } from '@/components/NotificationProvider';
import { motion, AnimatePresence } from 'framer-motion';

interface Activity {
  name: string;
  description: string;
  cost: number | string;
}

interface DayPlan {
  day: number;
  title: string;
  activities: (string | Activity)[];
  dailyFoodCost?: number | string;
  transportation?: { type: string; cost: number | string };
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
  startDate?: string;
  endDate?: string;
  itineraryData: DayPlan[];
  hotels: { name: string; price: string; rating: number; description?: string }[];
  flights?: {
    mode: string;
    route: string;
    estimatedCost: number | string;
    details: string;
  };
  totalEstimatedCost?: number;
}

const getCurrencySymbol = (code: string) => {
  const symbols: Record<string, string> = {
    'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥'
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
      const activity = newData[dayIndex].activities[activityIndex];
      if (typeof activity === 'string') {
        newData[dayIndex].activities[activityIndex] = value;
      } else {
        newData[dayIndex].activities[activityIndex] = { ...activity, name: value };
      }
      setEditedData(newData);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium animate-pulse">Loading adventure...</p>
      </motion.div>
    </div>
  );

  if (!itinerary) return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="premium-card p-12">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <X className="text-red-400" size={40} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Itinerary Not Found</h2>
        <p className="text-slate-400 mb-8">This itinerary doesn't exist or you don't have access.</p>
        <button onClick={() => router.push('/dashboard')} className="btn-primary">Return to Dashboard</button>
      </motion.div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-12"
    >
      <div className="flex flex-wrap items-center justify-between mb-10 gap-4">
        <button onClick={() => router.push('/dashboard')} className="flex items-center gap-2 text-slate-500 hover:text-[var(--foreground)] transition-all group">
          <div className="w-10 h-10 rounded-full bg-[var(--input-bg)] flex items-center justify-center group-hover:bg-[var(--input-border)] transition-all border border-[var(--input-border)]">
            <ArrowLeft size={18} />
          </div>
          <span className="font-black text-xs uppercase tracking-widest">Back to Home</span>
        </button>
      </div>

      <div className="pb-20">
        {/* Hero Header */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 mb-16 px-2"
        >
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold uppercase tracking-widest text-[10px]">
              <Sparkles size={12} />
              <span>AI Evolution Plan</span>
            </div>
            
            <h1 className="text-4xl xs:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none break-words">
              {itinerary.destination}
            </h1>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge 
                icon={<Calendar size={14} />} 
                label={itinerary.startDate && itinerary.endDate 
                  ? `${new Date(itinerary.startDate).toLocaleDateString()} - ${new Date(itinerary.endDate).toLocaleDateString()}`
                  : `${itinerary.days} Days`
                } 
              />
              <Badge 
                icon={<></>} 
                label={`${getCurrencySymbol(itinerary.currency)} ${itinerary.totalEstimatedCost || itinerary.budget}`} 
                className="text-emerald-400 border-emerald-500/10 bg-emerald-500/5"
              />
              <Badge 
                icon={<Users size={14} />} 
                label={`${itinerary.guests.adults} Adults · ${itinerary.guests.children} Children · ${itinerary.guests.pets} Pets `}
                className="text-indigo-400 border-indigo-500/10 bg-indigo-500/5 text-xs font-bold"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto shrink-0">
            <AnimatePresence mode="wait">
              {isEditing ? (
                <motion.div 
                  key="edit-actions"
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col sm:flex-row gap-3 w-full"
                >
                  <button 
                    onClick={() => { setIsEditing(false); setEditedData(itinerary.itineraryData); }} 
                    className="bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-2 border border-white/10 transition-all font-bold text-sm w-full"
                  >
                    <X size={18} /> Cancel
                  </button>
                  <button 
                    onClick={handleSave} 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-2xl shadow-emerald-500/20 transition-all font-bold text-sm w-full"
                  >
                    <Check size={18} /> Save Plan
                  </button>
                </motion.div>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="btn-primary flex items-center justify-center gap-3 px-10 py-5 rounded-2xl shadow-2xl shadow-blue-500/20 font-bold text-lg w-full sm:w-auto hover:scale-105 active:scale-95 transition-all"
                >
                  <Edit2 size={20} /> Edit Itinerary
                </button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Main Itinerary */}
          <div className="lg:col-span-8 space-y-12">
            {editedData.map((day, dIdx) => (
              <motion.div 
                key={dIdx} 
                initial={{ opacity: 0, x: -20 }} 
                whileInView={{ opacity: 1, x: 0 }} 
                viewport={{ once: true }}
                transition={{ delay: dIdx * 0.1 }}
                className="relative pl-12 sm:pl-20"
              >
                {/* Vertical Connector Line */}
                {dIdx !== editedData.length - 1 && (
                  <div className="absolute left-[20px] sm:left-[36px] top-14 bottom-[-48px] w-1 bg-gradient-to-b from-blue-500/30 to-transparent rounded-full" />
                )}
                
                {/* Day Number */}
                <div className="absolute left-0 top-0 w-10 sm:w-[72px] h-10 sm:h-[72px] rounded-3xl bg-[var(--background)] border-2 border-blue-500 flex items-center justify-center text-[var(--foreground)] font-black text-xl sm:text-3xl shadow-[0_0_30px_rgba(59,130,246,0.3)] z-10">
                  {day.day}
                </div>

                <div className="premium-card p-6 sm:p-10 border-white/5 relative overflow-hidden group/day hover:border-blue-500/30 transition-all">
                  <div className="relative z-10 mb-10">
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
                      <h3 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight uppercase">{day.title}</h3>
                    )}
                  </div>
                  
                  <div className="space-y-8">
                    {day.activities.map((activity, aIdx) => (
                      <div key={aIdx} className="flex gap-6 items-start group/act">
                        <div className="mt-2.5 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)] shrink-0 group-hover/act:scale-150 transition-transform" />
                        {isEditing ? (
                          <textarea 
                            className="glass-input w-full min-h-[100px] text-slate-300 bg-white/5"
                            value={typeof activity === 'string' ? activity : activity.name}
                            onChange={(e) => handleActivityChange(dIdx, aIdx, e.target.value)}
                          />
                        ) : (
                          <div className="flex-1">
                            {typeof activity === 'string' ? (
                              <p className="text-[var(--foreground)]/80 dark:text-slate-300 leading-relaxed text-lg sm:text-xl font-medium tracking-wide">{activity}</p>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex justify-between items-start gap-4">
                                  <h4 className="text-[var(--foreground)] text-lg sm:text-xl font-bold">{activity.name}</h4>
                                  <span className="text-emerald-400 font-bold shrink-0">
                                    {getCurrencySymbol(itinerary.currency)} {activity.cost}
                                  </span>
                                </div>
                                <p className="text-[var(--foreground)]/60 dark:text-slate-400 leading-relaxed text-base">{activity.description}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Day Footer with Costs */}
                {!isEditing && (day.dailyFoodCost || day.transportation) && (
                  <div className="mt-4 flex flex-wrap gap-4 pl-6 sm:pl-10">
                    {day.dailyFoodCost && (
                      <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">Food</span>
                        <span className="text-sm font-bold text-emerald-400">{getCurrencySymbol(itinerary.currency)} {day.dailyFoodCost}</span>
                      </div>
                    )}
                    {day.transportation && (
                      <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500">{day.transportation.type}</span>
                        <span className="text-sm font-bold text-emerald-400">{getCurrencySymbol(itinerary.currency)} {day.transportation.cost}</span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-10 lg:sticky lg:top-24">
            {/* Hotels */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="premium-card p-8 bg-white/[0.01] border-white/5"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                  <Hotel size={24} />
                </div>
                <h4 className="text-xl font-black uppercase tracking-tight">Stay Recs</h4>
              </div>
              
              <div className="space-y-6">
                {itinerary.hotels.map((hotel, hIdx) => (
                  <div key={hIdx} className="group/hotel bg-[var(--input-bg)] border border-[var(--input-border)] rounded-3xl p-6 hover:border-blue-500/40 hover:bg-white/[0.08] transition-all cursor-default shadow-lg shadow-black/5">
                    <div className="font-black text-lg mb-4 group-hover/hotel:text-blue-400 transition-colors uppercase tracking-tight leading-tight">{hotel.name}</div>
                    <div className="flex justify-between items-center bg-[var(--foreground)]/5 p-3 rounded-2xl">
                      <span className="text-emerald-400 font-black text-sm">{hotel.price}</span>
                      <div className="flex items-center gap-1.5 text-yellow-500">
                        <Sparkles size={14} className="fill-current" />
                        <span className="font-black text-sm">{hotel.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Flights / Transportation */}
            {itinerary.flights && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="premium-card p-8 bg-blue-600/5 border-blue-500/20"
              >
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                    <MapIcon size={24} />
                  </div>
                  <h4 className="text-xl font-black uppercase tracking-tight">Travel Info</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">{itinerary.flights.mode}</span>
                    <span className="text-emerald-400 font-black text-sm">
                      {getCurrencySymbol(itinerary.currency)} {itinerary.flights.estimatedCost}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-[var(--foreground)]">{itinerary.flights.route}</div>
                  <p className="text-xs text-slate-400 leading-relaxed">{itinerary.flights.details}</p>
                </div>
              </motion.div>
            )}

            {/* Vibes */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
               className="premium-card p-8 bg-gradient-to-br from-indigo-600/10 to-blue-600/10 border-blue-500/20"
            >
              <div className="flex items-center gap-3 mb-6">
                <Compass className="text-blue-400" size={20} />
                <h4 className="text-lg font-black uppercase tracking-tight">Vibe Tags</h4>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {itinerary.interests.map(i => (
                  <span key={i} className="bg-[var(--input-bg)] px-4 py-2 rounded-xl text-[10px] font-black border border-[var(--input-border)] hover:bg-blue-500/30 hover:border-blue-500/40 transition-all cursor-default">
                    # {i.toUpperCase()}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Travel Group */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
               className="premium-card p-8 border-[var(--input-border)]"
            >
              <h4 className="text-slate-500 font-black uppercase tracking-widest text-[10px] mb-6 text-center">Squad Specs</h4>
              <div className="grid grid-cols-3 gap-4">
                <GuestStat icon={<Users size={18} />} count={itinerary.guests.adults} label="ADULTS" />
                <GuestStat icon={<Baby size={18} />} count={itinerary.guests.children} label="CHILDREN" />
                <GuestStat icon={<Dog size={18} />} count={itinerary.guests.pets} label="PETS" />
              </div>
            </motion.div>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}

function GuestStat({ icon, count, label }: { icon: any, count: number, label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-[var(--input-bg)] rounded-3xl border border-dashed border-[var(--input-border)] hover:border-blue-500/40 transition-all group/stat">
      <div className="text-blue-400 group-hover/stat:scale-110 transition-transform">{icon}</div>
      <div className="text-2xl font-black">{count}</div>
      <div className="text-[8px] font-black text-slate-500 tracking-tighter">{label}</div>
    </div>
  );
}

function Badge({ icon, label, className = "" }: { icon: any, label: string, className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 bg-[var(--input-bg)] px-5 py-3 rounded-2xl border border-[var(--input-border)] text-[var(--foreground)]/80 font-black ${className}`}>
      <span className="text-current opacity-70">{icon}</span>
      <span className="text-[10px] uppercase tracking-wide">{label}</span>
    </div>
  );
}
