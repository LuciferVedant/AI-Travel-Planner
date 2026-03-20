'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';
import api from '@/api/apiConfig';
import { MapPin, Calendar, Compass, DollarSign, Sparkles, X, AlertCircle, Users, Baby, Dog, Plus, Minus } from 'lucide-react';
import { useNotification } from '@/components/NotificationProvider';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

export default function CreateTrip() {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState<number | ''>('');
  const [currency, setCurrency] = useState('INR');
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [guests, setGuests] = useState({ adults: 1, children: 0, pets: 0 });
  const [loading, setLoading] = useState(false);
  
  // Validation Errors
  const [errors, setErrors] = useState<{ destination?: string; days?: string }>({});

  const { token } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

  const validate = () => {
    const newErrors: { destination?: string; days?: string } = {};
    if (!destination.trim()) newErrors.destination = 'Destination is required';
    if (!days || days < 1) newErrors.days = 'Duration must be at least 1 day';
    if (days > 14) newErrors.days = 'Maximum duration is 14 days';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddInterest = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && interestInput.trim()) {
      e.preventDefault();
      if (!interests.includes(interestInput.trim())) {
        setInterests([...interests, interestInput.trim()]);
      }
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
        days, 
        interests, 
        guests,
        budget: budget === '' ? undefined : budget,
        currency 
      };
      
      const res = await api.post('/itineraries/generate', payload);
      showNotification('Itinerary generated successfully!', 'success');
      router.push(`/itinerary/${res.data._id}`);
    } catch (err: any) {
      console.error('Generation failed', err);
      showNotification(err.response?.data?.message || 'Failed to generate itinerary. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Plan Your <span className="text-gradient">Dream Trip</span></h1>
        <p className="text-slate-400">Personalized itineraries for you and your companions.</p>
      </div>

      <form onSubmit={handleSubmit} className="premium-card p-10 space-y-10 shadow-2xl relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-xl font-bold text-white mb-2">Crafting Your Perfect Trip...</p>
            <p className="text-slate-400">Our AI is designing something special for your group.</p>
          </div>
        )}

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <MapPin size={16} className="text-blue-400" />
              <span>Destination *</span>
            </label>
            <input 
              type="text" 
              className={`glass-input w-full ${errors.destination ? 'border-red-500/50 bg-red-500/5' : ''}`}
              placeholder="e.g. Paris, Tokyo, Bali"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                if (errors.destination) setErrors({ ...errors, destination: undefined });
              }}
            />
            {errors.destination && (
              <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1 animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={12} />
                <span>{errors.destination}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <Calendar size={16} className="text-blue-400" />
              <span>Duration (Days) *</span>
            </label>
            <input 
              type="number" 
              className={`glass-input w-full ${errors.days ? 'border-red-500/50 bg-red-500/5' : ''}`}
              min="1"
              max="14"
              value={days}
              onChange={(e) => {
                setDays(parseInt(e.target.value) || 0);
                if (errors.days) setErrors({ ...errors, days: undefined });
              }}
            />
            {errors.days && (
              <div className="flex items-center gap-1.5 text-red-400 text-xs mt-1 animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={12} />
                <span>{errors.days}</span>
              </div>
            )}
          </div>
        </div>

        {/* Guests Selection */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Users size={16} className="text-blue-400" />
            <span>Who is travelling?</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Counter 
              label="Adults" 
              sub="Age 13+" 
              icon={<Users size={18} />} 
              value={guests.adults} 
              onDec={() => updateGuest('adults', -1)} 
              onInc={() => updateGuest('adults', 1)} 
            />
            <Counter 
              label="Children" 
              sub="Age 2-12" 
              icon={<Baby size={18} />} 
              value={guests.children} 
              onDec={() => updateGuest('children', -1)} 
              onInc={() => updateGuest('children', 1)} 
            />
            <Counter 
              label="Pets" 
              sub="Tail waggers" 
              icon={<Dog size={18} />} 
              value={guests.pets} 
              onDec={() => updateGuest('pets', -1)} 
              onInc={() => updateGuest('pets', 1)} 
            />
          </div>
        </div>

        {/* Budget & Currency */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <DollarSign size={16} className="text-blue-400" />
              <span>Budget (Optional)</span>
            </label>
            <input 
              type="number" 
              className="glass-input w-full"
              placeholder="Leave empty for AI estimate"
              value={budget}
              onChange={(e) => setBudget(e.target.value === '' ? '' : parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">Currency</label>
            <select 
              className="glass-input w-full appearance-none cursor-pointer"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code} className="bg-slate-900">{c.code} ({c.symbol})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Interests */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Compass size={16} className="text-blue-400" />
            <span>Interests (Optional)</span>
          </label>
          <input 
            type="text" 
            className="glass-input w-full"
            placeholder="Type and press Enter"
            value={interestInput}
            onChange={(e) => setInterestInput(e.target.value)}
            onKeyDown={handleAddInterest}
          />
          
          <div className="flex flex-wrap gap-2">
            {interests.map((interest) => (
              <span key={interest} className="flex items-center gap-2 bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-full text-sm border border-blue-500/30">
                {interest}
                <button type="button" onClick={() => removeInterest(interest)} className="hover:text-white transition-colors">
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <button type="submit" className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3">
          <Sparkles size={22} />
          <span>Generate Itinerary</span>
        </button>
      </form>
    </div>
  );
}

function Counter({ label, sub, icon, value, onDec, onInc }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
          {icon}
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{label}</div>
          <div className="text-slate-500 text-[10px] uppercase tracking-wider">{sub}</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button 
          type="button" 
          onClick={onDec}
          className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-all"
        >
          <Minus size={14} />
        </button>
        <span className="text-white font-bold w-4 text-center">{value}</span>
        <button 
          type="button" 
          onClick={onInc}
          className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-all"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
