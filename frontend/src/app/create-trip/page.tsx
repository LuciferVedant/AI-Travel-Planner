'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';
import api from '@/api/apiConfig';
import { MapPin, Calendar, Compass, DollarSign, Sparkles, X, AlertCircle } from 'lucide-react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      const payload = { 
        destination, 
        days, 
        interests, 
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
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Start Your Next <span className="text-gradient">Adventure</span></h1>
        <p className="text-slate-400">Tell us where you want to go, and our AI will plan everything for you.</p>
      </div>

      <form onSubmit={handleSubmit} className="premium-card p-10 space-y-8 shadow-2xl relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="text-xl font-bold text-white mb-2">Crafting Your Perfect Trip...</p>
            <p className="text-slate-400">Our AI agent is exploring {destination || 'the world'} for you.</p>
          </div>
        )}

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
              <span>Number of Days *</span>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <DollarSign size={16} className="text-blue-400" />
              <span>Budget (Optional)</span>
            </label>
            <input 
              type="number" 
              className="glass-input w-full"
              placeholder="Leave empty for AI to estimate"
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

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Compass size={16} className="text-blue-400" />
            <span>Interests (Optional)</span>
          </label>
          <input 
            type="text" 
            className="glass-input w-full"
            placeholder="Type and press Enter (e.g. History, Food, Hiking)"
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
