// import React, { useState, useEffect, useRef } from 'react';
// import { format, isToday, isYesterday } from 'date-fns';
// import {
//   Box,
//   Typography,
//   Avatar,
//   Divider,
//   Chip,
//   CircularProgress,
//   IconButton,
//   TextField,
// } from '@mui/material';
// import api from '../utils/api';
// import MessageBubble from './MessageBubble';
// import { SendIcon, AttachFileIcon } from './Icons';

// function ChatArea({ selectedUser, currentUser, socket }) {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [loading, setLoading] = useState(false);

//   const messagesEndRef = useRef(null);
//   const fileInputRef = useRef(null);

//   const getId = (val) => {
//     if (!val) return null;
//     if (typeof val === 'string') return val;
//     if (typeof val === 'object') return val._id || val.id || null;
//     return null;
//   };

//   useEffect(() => {
//     if (!selectedUser?._id || !currentUser?._id) return;
//     fetchMessages();
//   }, [selectedUser?._id, currentUser?._id]);

//   const fetchMessages = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get(`/messages/${selectedUser._id}`);
//       const data = res.data || [];
//       data.sort(
//         (a, b) =>
//           new Date(a.createdAt).getTime() -
//           new Date(b.createdAt).getTime()
//       );
//       setMessages(data);
//     } catch (err) {
//       console.error('Error fetching messages:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!socket || !selectedUser || !currentUser) return;

//     const handleNewMessage = (message) => {
//       if (!message.sender || !message.receiver) return;

//       const senderId = getId(message.sender);
//       const receiverId = getId(message.receiver);
//       if (!senderId || !receiverId) return;

//       const isThisChat =
//         (senderId === selectedUser._id &&
//           receiverId === currentUser._id) ||
//         (senderId === currentUser._id &&
//           receiverId === selectedUser._id);

//       if (!isThisChat) return;

//       setMessages((prev) => {
//         if (prev.some((m) => m._id === message._id)) return prev;
//         return [...prev, message];
//       });
//     };

//     socket.on('newMessage', handleNewMessage);
//     return () => {
//       socket.off('newMessage', handleNewMessage);
//     };
//   }, [socket, selectedUser, currentUser]);

//   useEffect(() => {
//     if (messagesEndRef.current) {
//       messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
//     }
//   }, [messages]);

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!selectedUser) return;

//     const file = fileInputRef.current?.files[0];
//     if (!inputMessage.trim() && !file) return;

//     try {
//       const formData = new FormData();
//       formData.append('receiverId', selectedUser._id);

//       if (file) {
//         formData.append('file', file);
//         formData.append('type', 'file');
//         if (inputMessage.trim()) {
//           formData.append('content', inputMessage.trim());
//         }
//       } else {
//         formData.append('content', inputMessage.trim());
//         formData.append('type', 'text');
//       }

//       const res = await api.post('/messages', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       const savedMessage = res.data;

//       setMessages((prev) =>
//         prev.some((m) => m._id === savedMessage._id)
//           ? prev
//           : [...prev, savedMessage]
//       );

//       setInputMessage('');
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
//     } catch (err) {
//       console.error('Error sending message:', err);
//     }
//   };

//   const formatDateHeader = (date) => {
//     const d = new Date(date);
//     if (isToday(d)) return 'Today';
//     if (isYesterday(d)) return 'Yesterday';
//     return format(d, 'dd MMM yyyy');
//   };

//   const sorted = [...messages].sort(
//     (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
//   );

//   const groupedMessages = sorted.reduce((groups, message) => {
//     const key = format(new Date(message.createdAt), 'yyyy-MM-dd');
//     if (!groups[key]) groups[key] = [];
//     groups[key].push(message);
//     return groups;
//   }, {});

//   if (!selectedUser) {
//     return (
//       <Box
//         sx={{
//           flex: 1,
//           bgcolor: '#f5f5f5',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}
//       >
//         <Typography>Select a user to start chatting</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box
//       sx={{
//         flex: 1,
//         display: 'flex',
//         flexDirection: 'column',
//         height: '100%',
//         bgcolor: '#e3f2fd',
//       }}
//     >
//       <Box
//         sx={{
//           display: 'flex',
//           alignItems: 'center',
//           gap: 1.5,
//           px: 2,
//           py: 1,
//           bgcolor: '#ffffff',
//           borderBottom: '1px solid #e0e0e0',
//         }}
//       >
//         <Avatar
//           sx={{ bgcolor: '#1565c0', color: '#ffffff', fontWeight: 600 }}
//         >
//           {selectedUser.name?.charAt(0).toUpperCase()}
//         </Avatar>
//         <Typography variant="subtitle1" fontWeight={600}>
//           {selectedUser.name}
//         </Typography>
//       </Box>

//       <Box
//         sx={{
//           flex: 1,
//           overflowY: 'auto',
//           px: 1,
//           py: 1,
//         }}
//       >
//         {loading ? (
//           <Box
//             height="100%"
//             display="flex"
//             alignItems="center"
//             justifyContent="center"
//           >
//             <CircularProgress size={24} />
//           </Box>
//         ) : sorted.length === 0 ? (
//           <Box
//             height="100%"
//             display="flex"
//             alignItems="center"
//             justifyContent="center"
//           >
//             <Typography variant="body2" color="text.secondary">
//               No messages yet. Say hi
//             </Typography>
//           </Box>
//         ) : (
//           <>
//             {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
//               <Box key={dateKey}>
//                 <Divider sx={{ my: 1.5 }}>
//                   <Chip
//                     label={formatDateHeader(dateKey)}
//                     size="small"
//                     variant="outlined"
//                     sx={{
//                       borderColor: '#1565c0',
//                       color: '#1565c0',
//                       backgroundColor: '#ffffff',
//                     }}
//                   />
//                 </Divider>

//                 {msgs.map((message) => {
//                   const senderId = getId(message.sender);
//                   const isOwnMessage = senderId === currentUser._id;

//                   return (
//                     <Box key={message._id + '-wrapper'}>
//                       <MessageBubble
//                         message={message}
//                         isOwnMessage={isOwnMessage}
//                       />
//                     </Box>
//                   );
//                 })}
//               </Box>
//             ))}
//             <div ref={messagesEndRef} />
//           </>
//         )}
//       </Box>

//       <Box
//         component="form"
//         onSubmit={handleSendMessage}
//         sx={{
//           display: 'flex',
//           alignItems: 'center',
//           gap: 1,
//           px: 1.5,
//           py: 1,
//           bgcolor: '#ffffff',
//           borderTop: '1px solid #e0e0e0',
//         }}
//       >
//         <input
//           ref={fileInputRef}
//           type="file"
//           style={{ display: 'none' }}
//           onChange={(e) => {
//             if (e.target.files[0] && !inputMessage) {
//               setInputMessage(e.target.files[0].name);
//             }
//           }}
//         />
//         <IconButton
//           type="button"
//           onClick={() => fileInputRef.current?.click()}
//           size="small"
//         >
//           <AttachFileIcon fontSize="small" />
//         </IconButton>

//         <TextField
//           size="small"
//           fullWidth
//           variant="outlined"
//           placeholder="Type a message"
//           value={inputMessage}
//           onChange={(e) => setInputMessage(e.target.value)}
//           sx={{
//             '& .MuiOutlinedInput-root': {
//               '& fieldset': {
//                 borderColor: '#e0e0e0',
//               },
//               '&:hover fieldset': {
//                 borderColor: '#e0e0e0',
//               },
//               '&.Mui-focused fieldset': {
//                 borderColor: '#e0e0e0',
//               },
//             },
//           }}
//         />


//         <IconButton
//           type="submit"
//           sx={{ color: '#1565c0' }}
//           disabled={
//             !inputMessage.trim() && !fileInputRef.current?.files[0]
//           }
//         >
//           <SendIcon />
//         </IconButton>
//       </Box>
//     </Box>
//   );
// }

// export default ChatArea;

import React, { useState, useEffect, useRef } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import {
  Box,
  Typography,
  Avatar,
  Divider,
  Chip,
  CircularProgress,
  IconButton,
  TextField,
} from '@mui/material';
import api from '../utils/api';
import MessageBubble from './MessageBubble';
import { SendIcon, AttachFileIcon } from './Icons';

function ChatArea({ selectedUser, currentUser, socket }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const getId = (val) => {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (typeof val === 'object') return val._id || val.id || null;
    return null;
  };

  useEffect(() => {
    if (!selectedUser?._id || !currentUser?._id) return;
    fetchMessages();
  }, [selectedUser?._id, currentUser?._id]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/messages/${selectedUser._id}`);
      const data = res.data || [];
      data.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() -
          new Date(b.createdAt).getTime()
      );
      setMessages(data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // FIX: Socket event listener for real-time messages
  useEffect(() => {
    if (!socket || !selectedUser || !currentUser) {
      console.log('Socket not ready:', { socket: !!socket, selectedUser: !!selectedUser, currentUser: !!currentUser });
      return;
    }

    console.log('Setting up socket listeners for chat with:', selectedUser.name);

    const handleNewMessage = (message) => {
      console.log('📨 Received new message:', message);
      
      if (!message.sender || !message.receiver) {
        console.log('Invalid message - missing sender or receiver');
        return;
      }

      const senderId = getId(message.sender);
      const receiverId = getId(message.receiver);
      
      if (!senderId || !receiverId) {
        console.log('Could not extract IDs from message');
        return;
      }

      // Check if this message belongs to the current conversation
      const isThisChat =
        (senderId === selectedUser._id && receiverId === currentUser._id) ||
        (senderId === currentUser._id && receiverId === selectedUser._id);

      console.log('Message check:', {
        senderId,
        receiverId,
        selectedUserId: selectedUser._id,
        currentUserId: currentUser._id,
        isThisChat
      });

      if (!isThisChat) {
        console.log('Message not for this chat, ignoring');
        return;
      }

      // Add message to state if not already present
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id);
        if (exists) {
          console.log('Message already exists, skipping');
          return prev;
        }
        console.log('✅ Adding new message to chat');
        return [...prev, message];
      });
    };

    // FIX: Also listen for 'messageSent' event for messages we send
    const handleMessageSent = (message) => {
      console.log('📤 Message sent confirmation:', message);
      
      if (!message.sender || !message.receiver) return;

      const senderId = getId(message.sender);
      const receiverId = getId(message.receiver);
      
      if (!senderId || !receiverId) return;

      const isThisChat =
        (senderId === selectedUser._id && receiverId === currentUser._id) ||
        (senderId === currentUser._id && receiverId === selectedUser._id);

      if (!isThisChat) return;

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
    };

    // Register event listeners
    socket.on('newMessage', handleNewMessage);
    socket.on('messageSent', handleMessageSent);

    console.log('✅ Socket listeners registered');

    // Cleanup
    return () => {
      console.log('Removing socket listeners');
      socket.off('newMessage', handleNewMessage);
      socket.off('messageSent', handleMessageSent);
    };
  }, [socket, selectedUser, currentUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    const file = fileInputRef.current?.files[0];
    if (!inputMessage.trim() && !file) return;

    try {
      const formData = new FormData();
      formData.append('receiverId', selectedUser._id);

      if (file) {
        formData.append('file', file);
        formData.append('type', 'file');
        if (inputMessage.trim()) {
          formData.append('content', inputMessage.trim());
        }
      } else {
        formData.append('content', inputMessage.trim());
        formData.append('type', 'text');
      }

      console.log('Sending message to:', selectedUser._id);

      const res = await api.post('/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const savedMessage = res.data;
      console.log('✅ Message saved:', savedMessage);

      // FIX: Emit the message via socket for real-time delivery
      if (socket && socket.connected) {
        console.log('Emitting sendMessage event');
        socket.emit('sendMessage', { savedMessage });
      } else {
        console.warn('Socket not connected, message will not be sent in real-time');
      }

      // Add message to local state immediately
      setMessages((prev) => {
        const exists = prev.some((m) => m._id === savedMessage._id);
        if (exists) return prev;
        return [...prev, savedMessage];
      });

      setInputMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const formatDateHeader = (date) => {
    const d = new Date(date);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'dd MMM yyyy');
  };

  const sorted = [...messages].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  const groupedMessages = sorted.reduce((groups, message) => {
    const key = format(new Date(message.createdAt), 'yyyy-MM-dd');
    if (!groups[key]) groups[key] = [];
    groups[key].push(message);
    return groups;
  }, {});

  if (!selectedUser) {
    return (
      <Box
        sx={{
          flex: 1,
          bgcolor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography>Select a user to start chatting</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: '#e3f2fd',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Avatar
          sx={{ bgcolor: '#1565c0', color: '#ffffff', fontWeight: 600 }}
        >
          {selectedUser.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Box flex={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            {selectedUser.name}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          px: 1,
          py: 1,
        }}
      >
        {loading ? (
          <Box
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <CircularProgress size={24} />
          </Box>
        ) : sorted.length === 0 ? (
          <Box
            height="100%"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Typography variant="body2" color="text.secondary">
              No messages yet. Say hi! 👋
            </Typography>
          </Box>
        ) : (
          <>
            {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
              <Box key={dateKey}>
                <Divider sx={{ my: 1.5 }}>
                  <Chip
                    label={formatDateHeader(dateKey)}
                    size="small"
                    variant="outlined"
                    sx={{
                      borderColor: '#1565c0',
                      color: '#1565c0',
                      backgroundColor: '#ffffff',
                    }}
                  />
                </Divider>

                {msgs.map((message) => {
                  const senderId = getId(message.sender);
                  const isOwnMessage = senderId === currentUser._id;

                  return (
                    <Box key={message._id + '-wrapper'}>
                      <MessageBubble
                        message={message}
                        isOwnMessage={isOwnMessage}
                      />
                    </Box>
                  );
                })}
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>

      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 1,
          bgcolor: '#ffffff',
          borderTop: '1px solid #e0e0e0',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files[0] && !inputMessage) {
              setInputMessage(e.target.files[0].name);
            }
          }}
        />
        <IconButton
          type="button"
          onClick={() => fileInputRef.current?.click()}
          size="small"
        >
          <AttachFileIcon fontSize="small" />
        </IconButton>

        <TextField
          size="small"
          fullWidth
          variant="outlined"
          placeholder="Type a message"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
              '&:hover fieldset': {
                borderColor: '#e0e0e0',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#e0e0e0',
              },
            },
          }}
        />

        <IconButton
          type="submit"
          sx={{ color: '#1565c0' }}
          disabled={
            !inputMessage.trim() && !fileInputRef.current?.files[0]
          }
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default ChatArea;