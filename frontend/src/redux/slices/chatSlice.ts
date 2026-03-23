import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Message {
  _id: string;
  itineraryId: string;
  senderId: {
    _id: string;
    username: string;
  };
  content: string;
  messageType: 'text' | 'image' | 'video' | 'file';
  fileUrl?: string;
  createdAt: string;
}

interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setMessages, addMessage, setLoading, setError } = chatSlice.actions;
export default chatSlice.reducer;
