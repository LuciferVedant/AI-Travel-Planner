import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import Message from './models/Message.js';

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trippieai-travel-planner';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    
    const server = http.createServer(app);
    const io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true
      }
    });

    // Socket.io logic
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join_room', (itineraryId) => {
        socket.join(itineraryId);
        console.log(`User ${socket.id} joined room ${itineraryId}`);
      });

      socket.on('send_message', async (data) => {
        try {
          const { itineraryId, senderId, content, messageType, fileUrl } = data;
          
          // Save to DB
          const newMessage = new Message({
            itineraryId,
            senderId,
            content,
            messageType,
            fileUrl
          });
          await newMessage.save();

          // Populate sender info for the frontend
          const populatedMessage = await Message.findById(newMessage._id).populate('senderId', 'username');

          // Broadcast to room
          io.to(itineraryId).emit('receive_message', populatedMessage);
        } catch (err) {
          console.error('Socket send_message error:', err);
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });
