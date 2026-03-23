import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface JoinRequest {
  _id: string;
  itineraryId: string;
  userId: {
    _id: string;
    username: string;
    email: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  type: 'request' | 'invitation';
}

interface GroupState {
  publicTrips: any[];
  requests: JoinRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: GroupState = {
  publicTrips: [],
  requests: [],
  loading: false,
  error: null,
};

const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    setPublicTrips: (state, action: PayloadAction<any[]>) => {
      state.publicTrips = action.payload;
    },
    setRequests: (state, action: PayloadAction<JoinRequest[]>) => {
      state.requests = action.payload;
    },
    updateRequestStatus: (state, action: PayloadAction<{ requestId: string; status: 'accepted' | 'rejected' }>) => {
      const request = state.requests.find(r => r._id === action.payload.requestId);
      if (request) {
        request.status = action.payload.status;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setPublicTrips, setRequests, updateRequestStatus, setLoading, setError } = groupSlice.actions;
export default groupSlice.reducer;
