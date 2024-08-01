import React from 'react'

const ChatMessageBubble = ({content, timestamp, sender}) => {
    const styles = {
        currentUser: "ml-auto bg-blue-600 text-white",
        otherUser: "bg-slate-300 text-black"
    }
  return (
    <div className={`px-4 py-1 rounded-xl flex flex-col justify-center items-start max-w-[330px] leading-[18px] ${styles[sender]}`}>
        <p>{content}</p>
        <p className='text-[10px] ml-auto'>{timestamp}</p>
    </div>
  )
}

export default ChatMessageBubble