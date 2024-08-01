import React, { useState, useEffect} from 'react'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'
import ChatFriendCard from '../components/ChatFriendCard'
import ChatMessageBubble from '../components/ChatMessageBubble'

const Chat = () => {
    const user = auth.currentUser
    const [friends, setFriends] = useState([])
    const [filteredFriends, setFilteredFriends] = useState(friends)

    useEffect(() => {
        (
            async() => {
                try{
                    const token = await user.getIdToken()
                    const { data } = await axiosInstance.get("/api/friends", { 
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })

                    if(data){
                        console.log(data)
                        setFriends(data)
                        setFilteredFriends(data)
                    }
                }catch(err){
                    console.log(err)
                }
            }
        )()

    },[])

  return (
    <div className="flex min-h-screen pb-28 justify-center">
        <div className="mt-28 flex flex-col border rounded-lg bg-white w-1/2 max-w-[395px]">
        <div className="w-full flex items-center justify-center border-2 min-h-[75px]">
            <input type="text" className='bg-gray-100 w-full border py-2 mx-4 rounded-xl px-3' placeholder='Search Friend...'/>
        </div>
        <div className="w-full h-full flex flex-col overflow-scroll no-scrollbar">
            {
                filteredFriends.length > 0 && (
                    filteredFriends.map(friend => (
                        <ChatFriendCard {...friend} key={friend.id} />
                    ))
                )
            }
        </div>
        </div>

        <div className="mt-28 flex flex-col bg-white border w-full max-w-[680px]">
            <div className='border-2 min-h-[75px]'>

            </div>

            <div className='h-full w-full flex flex-col justify-end items-start px-5 py-3 overflow-scroll no-scrollbar'>
                
                <div className='ml-auto bg-blue-600 px-4 py-1 rounded-xl flex flex-col justify-center items-start max-w-[330px] leading-[18px]'>
                    <p className='text-white'>This is sender</p>
                    <p className='text-[10px] text-white ml-auto'>17:30</p>
                </div>
                <div className='bg-slate-300 px-4 py-1 rounded-xl flex flex-col justify-center items-start max-w-[330px] leading-[18px]'>
                    <p className='text-black'>This is receiver</p>
                    <p className='text-[10px] text-black ml-auto'>17:30</p>
                </div>
                <ChatMessageBubble message={"this is a message"} sender={"currentUser"} time={"12:00"}/>
            </div>

            <div className='w-full h-[70px] border mt-auto flex items-center gap-3 px-4'>
                <input type="text" placeholder='Type your message...' className='bg-gray-100 w-full border rounded-xl py-2 px-3'/>
                <button>Send</button>
            </div>
        </div>
    </div>
  )
}

export default Chat