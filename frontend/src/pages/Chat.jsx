import React, { useState, useEffect, useRef} from 'react'
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
    const [currentChat, setCurrentChat] = useState()
    //state used to display Loading component when data is being fetched
    const [loading, setLoading] = useState(true)
    //state needed to trigger data fetching (useEffect dependency)
    //this state will be increase by 1 each time the last HomeMealCard intersects with the viewport (infinite scrolling) 
    const [page, setPage] = useState(1)
    //state to detect if there are any logs left to fetch
    //since the system fetches 5 logs every time te infinite scrolling logic is triggered,
    //if the length of the returned logs is < 5, there are no more logs to fetch
    const [hasMoreLogs, setHasMoreLogs] = useState(true)
    //ref to keep the intersection observer instance
    const observer = useRef()
    //ref to keep a reference to the last HomeMealCard
    const lastLogRef = useRef()

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
            console.log("received message:", message)
        })

        return () => {
            socket.off("receiveMessage")
        }

    },[])

    useEffect(() => {
        (
            async() => {
                try{
                    const token = await user.getIdToken()
                    const { data } = await axiosInstance.get(`/api/chat/${currentChat.username}/messages`, { 
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
    }, [currentChat])

    const joinRoom = (friend) => {
        setCurrentChat({username: friend.username, uid: friend.uid})
        socket.emit("joinRoom", friend.uid)
    }

    const sendMessage = () => {
        if(newMessage.trim() && currentChat) {
            const message = {
                content: newMessage,
                receiverUid: currentChat.uid,
            }

            // const newMessageObj = {
            //     content: newMessage,
            //     senderUid: user.uid,
            //     receiverUid: currentChat,
            //     timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute:"2-digit"})
            // }

            socket.emit("sendMessage", message)
            console.log("new message emitted")
            setNewMessage("")
            //setMessages(prevMessages => [...prevMessages, newMessageObj])
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
                            joinRoom={() => joinRoom(friend)}
                        />
                    ))
                )
            }
        </div>
        </div>

        <div className="mt-28 flex flex-col bg-white border w-full max-w-[680px]">
            <div className='border-2 min-h-[75px]'>

            </div>

            <div className='h-full w-full flex flex-col justify-end items-start px-5 py-3 overflow-scroll no-scrollbar gap-3'>
                {
                    messages.map(message => (
                        <ChatMessageBubble {...message} sender={message.senderUid === user.uid ? "currentUser" : "otherUser"}/>
                    ))
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