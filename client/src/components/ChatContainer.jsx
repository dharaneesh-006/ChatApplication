import React, { useContext, useEffect, useRef, useState } from 'react';
import assets, { messagesDummyData } from '../assets/assets';
import { formatMessageTime } from '../lib/utils';
import { ChatContext } from '../../context/ChatContext.jsx';
import { AuthContext } from '../../context/AuthContext.jsx';
import toast from 'react-hot-toast';

const ChatContainer = () => {
  const { messages, selectedUser, setSelectedUser, sendMessage, getMessages } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const scrollEnd = useRef();
  const [input, setInput] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return null;
    await sendMessage({ text: input.trim() });
    setInput('');
  };

  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Select an image file');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return selectedUser ? (
    <div className='h-full w-full overflow-hidden relative bg-black/90 rounded-lg backdrop-blur-md shadow-xl'>
      {/* Header */}
      <div className='flex items-center gap-3 py-4 px-5 border-b border-white/10'>
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="profile" className='w-8 rounded-full' />
        <p className='flex-1 text-lg text-white flex items-center gap-2'>
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && <span className='w-2 h-2 rounded-full bg-green-500'></span>}

        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="Back"
          className='md:hidden w-5 cursor-pointer'
        />
        <img
          src={assets.help_icon}
          alt="Help"
          className='hidden md:block w-5 cursor-pointer'
        />
      </div>

      {/* Chat area */}
      <div className='flex flex-col h-[calc(100%-120px)] overflow-y-auto px-4 py-4 space-y-6'>
        {messages.map((msg, index) => {
          const isSelf = msg.senderId === authUser._id;
          return (
            <div
              key={index}
              className={`flex items-end gap-2 ${isSelf ? 'justify-end' : 'justify-start'}`}
            >
              {/* Show avatar & time on left for others */}
              {!isSelf && (
                <div className='text-center text-xs'>
                  <img
                    src={
                      msg.senderId === authUser._id
                        ? authUser?.profilePic || assets.avatar_icon
                        : selectedUser?.profilePic || assets.avatar_icon
                    }
                    alt=""
                    className='w-7 rounded-full mb-1'
                  />
                  <p className='text-gray-500'>{formatMessageTime(msg.createdAt)}</p>
                </div>
              )}

              {/* Message bubble or image */}
              {msg.image ? (
                <img
                  src={msg.image}
                  alt=""
                  className='max-w-[220px] rounded-xl border border-gray-600 shadow-lg'
                />
              ) : (
                <p
                  className={`text-white p-3 text-sm max-w-[250px] rounded-xl ${
                    isSelf
                      ? 'bg-violet-600/50 rounded-br-none'
                      : 'bg-gray-700/50 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </p>
              )}

              {/* Avatar & time on right for self */}
              {isSelf && (
                <div className='text-center text-xs'>
                  <img
                    src={assets.avatar_icon}
                    alt=""
                    className='w-7 rounded-full mb-1'
                  />
                  <p className='text-gray-500'>{formatMessageTime(msg.createdAt)}</p>
                </div>
              )}
            </div>
          );
        })}
        <div ref={scrollEnd}></div>
      </div>

      {/* Bottom input */}
      <div className='absolute bottom-0 left-0 right-0 px-4 py-3 flex items-center gap-3 backdrop-blur-lg bg-black/40 border-t border-white/10'>
        <div className='flex-1 flex items-center bg-gray-800/30 px-4 rounded-full'>
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e) => (e.key === 'Enter' ? handleSendMessage(e) : null)}
            type="text"
            placeholder='Send a message'
            className='flex-1 p-2 text-sm text-white bg-transparent outline-none placeholder-gray-400'
          />
          <input onChange={handleSendImage} type="file" id="image" accept="image/*" hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="Upload" className='w-5 cursor-pointer' />
          </label>
        </div>
        <img
          onClick={handleSendMessage}
          src={assets.send_button}
          alt="Send"
          className='w-7 cursor-pointer'
        />
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-900 to-black text-gray-400 max-md:hidden'>
      <img src={assets.logo_icon} alt="Logo" className='w-16 mb-2' />
      <p className='text-lg font-medium text-white'>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatContainer;
