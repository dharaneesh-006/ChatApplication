import React, { useContext, useEffect, useState } from 'react';
import assets, { imagesDummyData } from '../assets/assets';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';

const RightSidebar = () => {

  const {selectedUser, messages} = useContext(ChatContext);
  const {logout, onlineUsers} =  useContext(AuthContext);

  const [msgImages, setMsgImages] = useState([]);

  //get all the images from chats

  useEffect(()=>{
    setMsgImages(
      messages.filter(msg => msg.image).map(msg=>msg.image)
    )
  },[messages])

  return selectedUser && (
    <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${selectedUser ? 'max-md:hidden' : ''}`}>
      
      {/* User Info */}
      <div className='pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto'>
        <img
          src={selectedUser?.profilePic || assets.avatar_icon}
          alt="Profile"
          className='w-20 aspect-square rounded-full'
        />
        <h1 className='px-10 text-xl font-medium mx-auto flex items-center gap-2'>
          {onlineUsers.includes(selectedUser._id) && <p className='w-2 h-2 rounded-full bg-green-500'></p>}
          {selectedUser.fullName}
        </h1>
        <p className='px-10 text-center'>{selectedUser.bio}</p>
      </div>

      <hr className="border-[#ffffff50] my-4 mx-5" />

      {/* Media Section */}
      <div className='px-5 text-xs'>
        <p className='text-white font-semibold mb-2'>Media</p>
        <div className='max-h-[200px] overflow-y-scroll grid grid-cols-2 gap-3 pr-2'>
          {msgImages.map((url, index) => (
            <div
              key={index}
              onClick={() => window.open(url)}
              className='cursor-pointer hover:scale-105 transition-transform'
            >
              <img src={url} alt="media" className='w-full h-auto rounded-md shadow' />
            </div>
          ))}
        </div>
      </div>
      <button onClick={()=> logout()} className='absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-ehite border-none text-sm font-light py-2 px-20 rounded-full cursor-pointer'>
          Logout
      </button>
    </div>
  );
};

export default RightSidebar;
