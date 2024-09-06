import React from 'react'

//All the code in this file was written without assistance 

//UI component used for every message in a chat

const ChatMessageBubble = React.forwardRef(({content, timestamp, sender}, ref) => {
    const styles = {
        currentUser: "ml-auto bg-blue-600 text-white rounded-l-xl rounded-tr-xl",
        otherUser: "bg-slate-200 text-black rounded-r-xl rounded-tl-xl"
    }
  return (
    <div 
      ref={ref} 
      className={`px-4 min-w-[85px] py-1 flex flex-col justify-center items-start max-w-[330px] leading-[18px] ${styles[sender]}`}
    >
        <p>{content}</p>
        <p className='text-[10px] ml-auto'>{timestamp}</p>
    </div>
  )
})

export default ChatMessageBubble