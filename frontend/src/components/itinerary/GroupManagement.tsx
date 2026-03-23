'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { setRequests, updateRequestStatus, setLoading, setError } from '@/redux/slices/groupSlice';
import api from '@/api/apiConfig';
import { UserPlus, UserCheck, UserX, Shield, User, Search } from 'lucide-react';

interface GroupManagementProps {
  itineraryId: string;
  isAdmin: boolean;
  isCreator: boolean;
  members: any[];
  creator: any;
  onUpdate: () => void;
}

const GroupManagement: React.FC<GroupManagementProps> = ({ itineraryId, isAdmin, isCreator, members, creator, onUpdate }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { requests, loading } = useSelector((state: RootState) => state.group);
  const [inviteUsername, setInviteUsername] = useState('');

  useEffect(() => {
    if (isAdmin) {
      const fetchRequests = async () => {
        try {
          const response = await api.get(`/groups/requests/${itineraryId}`);
          dispatch(setRequests(response.data));
        } catch (err: any) {
          console.error('Failed to fetch requests');
        }
      };
      fetchRequests();
    }
  }, [itineraryId, isAdmin, dispatch]);

  const handleResponse = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      await api.post(`/groups/respond-request/${requestId}`, { status });
      dispatch(updateRequestStatus({ requestId, status }));
      onUpdate();
    } catch (err: any) {
      alert('Failed to respond to request');
    }
  };

  const handleInvite = async () => {
    if (!inviteUsername.trim()) return;
    try {
      await api.post(`/groups/invite/${itineraryId}`, { username: inviteUsername });
      alert('Invitation sent!');
      setInviteUsername('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send invitation');
    }
  };

  const handleRoleChange = async (targetUserId: string, role: 'admin' | 'member') => {
    try {
      await api.patch(`/groups/manage-member/${itineraryId}`, { targetUserId, role });
      onUpdate();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  return (
    <div className="space-y-8">
      {/* Join Requests Section */}
      {isAdmin && requests.length > 0 && (
        <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-6">
          <h4 className="text-blue-900 dark:text-blue-100 font-bold mb-4 flex items-center">
            <UserPlus className="w-5 h-5 mr-2" />
            Pending Join Requests
          </h4>
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request._id} className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-blue-50 dark:border-blue-900/30">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold mr-3">
                    {request.userId.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">@{request.userId.username}</p>
                    <p className="text-xs text-slate-500">{request.userId.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleResponse(request._id, 'accepted')}
                    className="p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors"
                  >
                    <UserCheck className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleResponse(request._id, 'rejected')}
                    className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"
                  >
                    <UserX className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Invite Member Section */}
      {isAdmin && (
        <section>
          <h4 className="font-bold text-slate-900 dark:text-white mb-4">Invite New Member</h4>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Enter username..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
                value={inviteUsername}
                onChange={(e) => setInviteUsername(e.target.value)}
              />
            </div>
            <button 
              onClick={handleInvite}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
            >
              Invite
            </button>
          </div>
        </section>
      )}

      {/* Members List Section */}
      <section>
        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Members ({members.length + 1})</h4>
        <div className="grid grid-cols-1 gap-3">
          {/* Creator */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center">
              <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold mr-3">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Admin (Creator)</p>
                <p className="text-xs text-slate-500">Self</p>
              </div>
            </div>
          </div>

          {/* Other Members */}
          {members.map((member) => (
            <div key={member.user._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-slate-100 dark:hover:bg-slate-900">
              <div className="flex items-center">
                <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-400 font-bold mr-3">
                  {member.role === 'admin' ? <Shield className="w-4 h-4 text-blue-500" /> : <User className="w-4 h-4" />}
                </div>
                <div>
                  {/* Note: members need to be populated with username */}
                  <p className="font-medium text-slate-900 dark:text-white">{member.user.username || 'Member'}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{member.role}</p>
                </div>
              </div>
              
              {isCreator && (
                <select 
                  className="bg-transparent border-none text-xs font-medium text-blue-600 focus:ring-0 cursor-pointer"
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.user._id, e.target.value as 'admin' | 'member')}
                >
                  <option value="member">Make Member</option>
                  <option value="admin">Make Admin</option>
                </select>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default GroupManagement;
