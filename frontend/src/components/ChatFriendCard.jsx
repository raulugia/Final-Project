import React from 'react'

//All the code in this file was written without assistance 

//UI component

const ChatFriendCard = ({name, surname, username, joinRoom, currentChat, profileThumbnailUrl}) => {

  return (
    <div
        onClick = { joinRoom } 
        className={`flex items-center gap-5 border-b-[2px] py-2 px-5 hover:cursor-pointer ${currentChat?.username === username ? "bg-gray-100" : "bg-white hover:bg-slate-50"}`}
    >
        <div>
            <div className='bg-slate-700 rounded-full h-16 w-16 overflow-hidden'>
              {
                profileThumbnailUrl && (
                  <img src={profileThumbnailUrl} alt="profile picture" />
                )
              }
            </div>
        </div>
        <div>
            <p className='text-lg font-semibold'>{name} {surname}</p>
            <p>@{username}</p>
        </div>
    </div>
  )
}

export default ChatFriendCard