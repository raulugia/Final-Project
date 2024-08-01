import React, { useState, useEffect} from 'react'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'
import ChatFriendCard from '../components/ChatFriendCard'

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

        <div className="mt-28 flex flex-col bg-white border w-full max-w-[750px]">
            <div className='border-2 min-h-[75px]'>

            </div>
        </div>
    </div>
  )
}

export default Chat