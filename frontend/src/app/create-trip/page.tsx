'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';
import api from '@/api/apiConfig';
import { MapPin, Calendar, Compass, DollarSign, Sparkles, X } from 'lucide-react';
import { useNotification } from '@/components/NotificationProvider';

export default function CreateTrip() {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(1000);
  const [interestInput, setInterestInput] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { token } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!token) {
      router.push('/login');
    }
  }, [token, router]);

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
    setLoading(true);
    try {
      const res = await api.post('/itineraries/generate', 
        { destination, days, interests, budget }
      );
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
              <span>Destination</span>
            </label>
            <input 
              type="text" 
              className="glass-input w-full"
              placeholder="e.g. Paris, Tokyo, Bali"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <Calendar size={16} className="text-blue-400" />
              <span>Number of Days</span>
            </label>
            <input 
              type="number" 
              className="glass-input w-full"
              min="1"
              max="14"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <DollarSign size={16} className="text-blue-400" />
            <span>Approximate Budget ($)</span>
          </label>
          <input 
            type="number" 
            className="glass-input w-full"
            placeholder="Total budget for the trip"
            value={budget}
            onChange={(e) => setBudget(parseInt(e.target.value))}
            required
          />
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-300">
            <Compass size={16} className="text-blue-400" />
            <span>What are you interested in?</span>
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
                <button type="button" onClick={() => removeInterest(interest)} className="hover:text-white">
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
