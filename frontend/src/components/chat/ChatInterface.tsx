'use client';

import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/redux/store';
import { setMessages, addMessage, setLoading, setError } from '@/redux/slices/chatSlice';
import axios from 'axios';
import { Send, Image as ImageIcon, Paperclip, X, Download, FileText, Film, Users, MessageSquare } from 'lucide-react';

interface ChatInterfaceProps {
  itineraryId: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ itineraryId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { messages, loading, error } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
  const SOCKET_URL = API_URL.replace('/api', '');

  useEffect(() => {
    // Fetch chat history
    const fetchHistory = async () => {
      dispatch(setLoading(true));
      try {
        const response = await axios.get(`${API_URL}/chat/${itineraryId}`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        dispatch(setMessages(response.data));
      } catch (err: any) {
        dispatch(setError(err.response?.data?.message || 'Failed to load chat history'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchHistory();

    // Initialize Socket.io
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true
    });

    socketRef.current.emit('join_room', itineraryId);

    socketRef.current.on('receive_message', (message) => {
      dispatch(addMessage(message));
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [itineraryId, dispatch, API_URL]);

  useEffect(() => {
    // Scroll to bottom on new message
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!content.trim() || !socketRef.current || !user) return;

    const messageData = {
      itineraryId,
      senderId: user.id || user._id,
      content,
      messageType: 'text'
    };

    socketRef.current.emit('send_message', messageData);
    setContent('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !socketRef.current || !user) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/chat/upload`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });

      const { fileUrl, mimetype } = response.data;
      let messageType: 'image' | 'video' | 'file' = 'file';
      if (mimetype.startsWith('image/')) messageType = 'image';
      else if (mimetype.startsWith('video/')) messageType = 'video';

      const messageData = {
        itineraryId,
        senderId: user.id || user._id,
        content: file.name,
        messageType,
        fileUrl
      };

      socketRef.current.emit('send_message', messageData);
    } catch (err: any) {
      alert('Failed to upload file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const renderMessageContent = (msg: any) => {
    if (msg.messageType === 'text') return <p className="text-sm">{msg.content}</p>;
    
    // Cloudinary returns a full URL; local fallback also supported
    const fullFileUrl = msg.fileUrl?.startsWith('http') ? msg.fileUrl : `${SOCKET_URL}${msg.fileUrl}`;

    
    if (msg.messageType === 'image') {
      return (
        <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          <img src={fullFileUrl} alt={msg.content} className="max-w-full h-auto max-h-60 object-contain" />
        </div>
      );
    }
    
    if (msg.messageType === 'video') {
      return (
        <video controls className="mt-2 rounded-lg max-w-full h-auto max-h-60 border border-slate-200 dark:border-slate-700">
          <source src={fullFileUrl} />
        </video>
      );
    }

    return (
      <a 
        href={fullFileUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center p-3 mt-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 dark:border-slate-700"
      >
        <FileText className="w-5 h-5 mr-3 text-blue-500" />
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate">{msg.content}</p>
          <p className="text-xs text-slate-500 uppercase">Download</p>
        </div>
        <Download className="w-4 h-4 text-slate-400" />
      </a>
    );
  };

  return (
    <div className="flex flex-col h-[600px] premium-card overflow-hidden">
      <div className="p-4 border-b border-[var(--input-border)] flex justify-between items-center bg-[var(--input-bg)]">
        <h3 className="font-bold text-[var(--foreground)] flex items-center">
          <Users className="w-5 h-5 mr-2 text-blue-500" />
          Trip Chat
        </h3>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-[var(--background)]"
      >
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
            <MessageSquare className="w-12 h-12 opacity-20" />
            <p>No chat history yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((msg, idx) => {
          const isMe = msg.senderId?._id === (user?.id || user?._id);
          return (
            <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                isMe
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-500/10 shadow-lg'
                  : 'bg-[var(--input-bg)] text-[var(--foreground)] rounded-tl-none border border-[var(--input-border)]'
              }`}>
                {!isMe && <p className="text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60">@{msg.senderId?.username}</p>}
                {renderMessageContent(msg)}
                <p className={`text-[10px] mt-2 opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-[var(--input-bg)] border-t border-[var(--input-border)]">
        <div className="flex items-center gap-2 bg-[var(--background)] border border-[var(--input-border)] rounded-xl p-2 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-blue-500 transition-colors relative"
          >
            {uploading ? <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" /> : <Paperclip className="w-5 h-5" />}
          </button>

          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-none focus:outline-none text-[var(--foreground)] px-2 py-1 text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />

          <button
            onClick={handleSendMessage}
            className={`p-2 rounded-lg transition-all ${
              content.trim() ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-300'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
