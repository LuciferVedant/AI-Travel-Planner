'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';
import api from '@/api/apiConfig';
import { MapPin, Calendar, Compass, DollarSign, Sparkles, X, AlertCircle, Users, Baby, Dog, Plus, Minus, ArrowLeft } from 'lucide-react';
import { useNotification } from '@/components/NotificationProvider';
import { motion, AnimatePresence } from 'framer-motion';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export default function CreateTrip() {
  const [destination, setDestination] = useState('');
  const [departureLocation, setDepartureLocation] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState<number | ''>('');
  const [currency, setCurrency] = useState('INR');
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [guests, setGuests] = useState({ adults: 1, children: 0, pets: 0 });
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  
  const [errors, setErrors] = useState<{ destination?: string; departureLocation?: string; days?: string }>({});
  const { token } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token, router]);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (diffDays > 0 && diffDays <= 14) {
        setDays(diffDays);
        setErrors(prev => ({ ...prev, days: undefined }));
      } else if (diffDays > 14) {
        setErrors(prev => ({ ...prev, days: 'Duration cannot exceed 14 days' }));
      }
    }
  }, [startDate, endDate]);

  const validate = () => {
    const newErrors: { destination?: string; departureLocation?: string; days?: string } = {};
    if (!destination.trim()) newErrors.destination = 'Destination is required';
    if (!departureLocation.trim()) newErrors.departureLocation = 'Starting point is required';
    if (!startDate || !endDate) newErrors.days = 'Please select travel dates';
    else if (days < 1) newErrors.days = 'Duration must be at least 1 day';
    else if (days > 14) newErrors.days = 'Maximum duration is 14 days';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddInterest = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && interestInput.trim()) {
      e.preventDefault();
      if (!interests.includes(interestInput.trim())) setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const updateGuest = (type: 'adults' | 'children' | 'pets', delta: number) => {
    setGuests(prev => ({
      ...prev,
      [type]: Math.max(type === 'adults' ? 1 : 0, prev[type] + delta)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { 
        destination, 
        departureLocation, 
        days, 
        interests, 
        guests, 
        budget: budget === '' ? undefined : budget, 
        currency,
        startDate,
        endDate
      };
      const res = await api.post('/itineraries/generate', payload);
      showNotification('Itinerary generated successfully!', 'success');
      router.push(`/itinerary/${res.data._id}`);
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Failed to generate itinerary.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 py-12"
    >
      <div className="mb-10 flex flex-col items-center text-center">
        <button onClick={() => router.back()} className="self-start flex items-center gap-2 text-slate-500 hover:text-[var(--foreground)] transition-colors mb-6 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-sm uppercase tracking-widest">Back</span>
        </button>
        <h1 className="text-4xl sm:text-6xl font-black text-[var(--foreground)] mb-4 tracking-tighter">
          PLAN YOUR <span className="text-gradient">NEXT VIBE</span>
        </h1>
        <p className="text-slate-500 font-medium">Personalized itineraries crafted by AI for your squad.</p>
      </div>

      <form onSubmit={handleSubmit} className="premium-card p-6 sm:p-12 space-y-12 shadow-2xl relative overflow-hidden bg-white/[0.02]">
        <AnimatePresence>
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[var(--background)]/90 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_30px_rgba(59,130,246,0.2)]"></div>
              <h2 className="text-3xl font-black text-[var(--foreground)] mb-3 tracking-tight">CRAFTING ADVENTURE...</h2>
              <p className="text-slate-400 font-medium max-w-xs">Our AI agent is currently analyzing thousands of possibilities for {destination}.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <InputGroup label="Starting From" icon={<Compass size={18} />} error={errors.departureLocation}>
            <input 
              type="text" className="glass-input w-full font-bold text-lg" placeholder="e.g. Mumbai, India"
              value={departureLocation} onChange={(e) => { setDepartureLocation(e.target.value); setErrors({...errors, departureLocation: undefined}); }}
            />
          </InputGroup>

          <InputGroup label="Destination" icon={<MapPin size={18} />} error={errors.destination}>
            <input 
              type="text" className="glass-input w-full font-bold text-lg" placeholder="e.g. Tokyo, Japan"
              value={destination} onChange={(e) => { setDestination(e.target.value); setErrors({...errors, destination: undefined}); }}
            />
          </InputGroup>

          <InputGroup label="Trip Dates" icon={<Calendar size={18} />} error={errors.days}>
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="date" className="glass-input w-full font-bold text-sm"
                min={today}
                value={startDate} onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate && e.target.value > endDate) setEndDate('');
                }}
              />
              <input 
                type="date" className="glass-input w-full font-bold text-sm"
                min={startDate || today}
                value={endDate} onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            {startDate && endDate && (
              <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mt-2 px-1">
                Duration: {days} Days
              </p>
            )}
          </InputGroup>
        </div>

        {/* Guests Selection */}
        <div className="space-y-6">
          <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
            <Users size={16} className="text-blue-500" />
            <span>Traveling Squad</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Counter  icon={<Users size={18} />} value={guests.adults} onDec={() => updateGuest('adults', -1)} onInc={() => updateGuest('adults', 1)} />
            <Counter  icon={<Baby size={18} />} value={guests.children} onDec={() => updateGuest('children', -1)} onInc={() => updateGuest('children', 1)} />
            <Counter  icon={<Dog size={18} />} value={guests.pets} onDec={() => updateGuest('pets', -1)} onInc={() => updateGuest('pets', 1)} />
          </div>
        </div>

        {/* Budget & Currency */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-4">
            <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
              <span>Budget (Optional)</span>
            </label>
            <input 
              type="number" className="glass-input w-full font-bold text-lg" placeholder="Leave empty for AI estimate"
              value={budget} onChange={(e) => setBudget(e.target.value === '' ? '' : parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Currency</label>
            <select className="glass-input w-full font-bold appearance-none cursor-pointer text-center" value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-slate-900">{c.code} ({c.symbol})</option>)}
            </select>
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-6">
          <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
            <Compass size={16} className="text-blue-400" />
            <span>Vibes & Interests</span>
          </label>
          <input 
            type="text" className="glass-input w-full font-bold" placeholder="Type interest and press Enter (e.g. Sushi, Hiking, Neon)"
            value={interestInput} onChange={(e) => setInterestInput(e.target.value)} onKeyDown={handleAddInterest}
          />
          <div className="flex flex-wrap gap-3">
            <AnimatePresence>
              {interests.map((interest) => (
                <motion.span 
                  key={interest} 
                  initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                  className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-xl text-xs font-black border border-blue-500/20 shadow-lg shadow-blue-500/5 group/tag"
                >
                  # {interest.toUpperCase()}
                  <button type="button" onClick={() => removeInterest(interest)} className="hover:text-red-500 transition-colors">
                    <X size={14} />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <button type="submit" className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(37,99,235,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Sparkles size={24} />
          <span>GENERATE ADVENTURE</span>
        </button>
      </form>
    </motion.div>
  );
}

function InputGroup({ label, icon, error, children, sub }: any) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <label className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-widest">
          {icon}
          <span>{label}</span>
        </label>
        {sub && <span className="text-[10px] text-slate-500 font-bold uppercase">{sub}</span>}
      </div>
      {children}
      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5 text-red-500 text-[10px] font-black uppercase tracking-wider">
          <AlertCircle size={12} />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
}

function Counter({ label, icon, value, onDec, onInc }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center justify-between shadow-xl group/counter">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/10 shrink-0 group-hover/counter:bg-blue-500 group-hover/counter:text-white transition-all">
          {icon}
        </div>
        <div className="text-white font-black text-[10px] uppercase tracking-widest truncate">{label}</div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button 
          type="button" onClick={onDec} 
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white active:scale-95 transition-all bg-white/[0.02]"
        >
          <Minus size={14} />
        </button>
        <div className="w-8 sm:w-10 text-center">
          <span className="text-[var(--foreground)] font-black text-base sm:text-lg">{value}</span>
        </div>
        <button 
          type="button" onClick={onInc} 
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl border border-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white active:scale-95 transition-all bg-white/[0.02]"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
