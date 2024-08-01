import React, { useState, useEffect} from 'react'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'
import ChatFriendCard from '../components/ChatFriendCard'
import ChatMessageBubble from '../components/ChatMessageBubble'
import socket from "../../utils/socket"


const Chat = () => {
    const user = auth.currentUser
    const [friends, setFriends] = useState([])
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState("")
    const [filteredFriends, setFilteredFriends] = useState(friends)
    const [currentChat, setCurrentChat] = useState(null)

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

        socket.on("receiveMessage", message => {
            setMessages(prevMessages => [...prevMessages, message])
        })

        return () => {
            socket.off("receiveMessage")
        }

    },[])

    const joinRoom = (friendUid) => {
        setCurrentChat(friendUid)
        socket.emit("joinRoom", friendUid)
    }

    const sendMessage = () => {
        if(newMessage.trim() && currentChat) {
            const message = {
                content: newMessage,
                receiverUid: currentChat.uid,
            }

            socket.emit("sendMessage", message)
            setNewMessage("")
        }
    }

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
                        <ChatFriendCard {...friend} key={friend.uid} 
                            joinRoom={() => joinRoom(friend.uid)}
                        />
                    ))
                )
            }
        </div>
        </div>

        <div className="mt-28 flex flex-col bg-white border w-full max-w-[680px]">
            <div className='border-2 min-h-[75px]'>

            </div>

            <div className='h-full w-full flex flex-col justify-end items-start px-5 py-3 overflow-scroll no-scrollbar'>
                {
                    messages.map(message => {
                        <ChatMessageBubble {...message} sender={message.senderUid === user.uid}/>
                    })
                }
            </div>

            <div className='w-full h-[70px] border mt-auto flex items-center gap-3 px-4'>
                <input type="text" placeholder='Type your message...' 
                    className='bg-gray-100 w-full border rounded-xl py-2 px-3'
                    onChange={e => setNewMessage(e.target.value)}
                />
                <button className='border' onClick={sendMessage}>Send</button>
            </div>
        </div>
    </div>
  )
}

export default Chat