'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { setPublicTrips, setLoading, setError } from '@/redux/slices/groupSlice';
import api from '@/api/apiConfig';
import { Search, MapPin, Users, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const DiscoverPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { publicTrips, loading, error } = useSelector((state: RootState) => state.group);
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPublicTrips = async () => {
      dispatch(setLoading(true));
      try {
        const response = await api.get(`/itineraries/public`);
        dispatch(setPublicTrips(response.data));
      } catch (err: any) {
        dispatch(setError(err.response?.data?.message || 'Failed to fetch public trips'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchPublicTrips();
  }, [dispatch]);

  const handleJoinRequest = async (itineraryId: string) => {
    try {
      await api.post(`/groups/request-join/${itineraryId}`);
      alert('Join request sent successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send join request');
    }
  };

  const filteredTrips = publicTrips.filter(trip => 
    trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.userId?.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[var(--background)] p-6 pt-24">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-[var(--foreground)] mb-4">Discover Public Trips</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Find amazing journeys planned by others, join their groups, and explore the world together.
          </p>
        </header>

        <div className="relative mb-8 max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by destination or traveler..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500">
            <p className="text-xl font-semibold">{error}</p>
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-xl">No public trips found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <div key={trip._id} className="premium-card overflow-hidden group">
                <div className="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium text-white border border-white/30">
                      {trip.days} Days
                    </span>
                    <span className="text-white/80 text-sm">
                      By @{trip.userId?.username}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white truncate">{trip.destination}</h3>
                </div>
                
                <div className="p-6">
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-slate-500 text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      From: {trip.departureLocation}
                    </div>
                    <div className="flex items-center text-slate-500 text-sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      {trip.startDate ? `${trip.startDate} - ${trip.endDate}` : 'Dates to be decided'}
                    </div>
                    <div className="flex items-center text-slate-500 text-sm">
                      <Users className="w-4 h-4 mr-2" />
                      {trip.members?.length + 1} Members
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link 
                      href={`/itinerary/${trip._id}`}
                      className="flex-1 text-center py-2.5 bg-[var(--input-bg)] hover:bg-[var(--input-border)] text-[var(--foreground)] rounded-lg font-medium transition-colors flex items-center justify-center text-sm border border-[var(--input-border)]"
                    >
                      View Details
                    </Link>
                    {(user?._id || user?.id) !== trip.userId?._id && !trip.members?.some((m: any) => m.user === (user?._id || user?.id)) && (
                      <button
                        onClick={() => handleJoinRequest(trip._id)}
                        className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                      >
                        Join Trip
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoverPage;
