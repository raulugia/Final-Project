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
    const [hasMoreMessages, setHasMoreMessages] = useState(true)
    //ref to keep the intersection observer instance
    const observer = useRef()
    //ref to keep a reference to the last HomeMealCard
    const oldestMessageRef = useRef()
    //
    const chatWindowRef = useRef()

    //get user's friends so user can message them
    useEffect(() => {
        (
            async() => {
                try{
                    //get id token
                    const token = await user.getIdToken()
                    //make api call to fetch all friends passing the token for authentication
                    const { data } = await axiosInstance.get("/api/friends", { 
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })

                    //case server responds
                    if(data){
                        console.log(data)
                        //update states to display friends
                        setFriends(data)
                        setFilteredFriends(data)
                    }
                }catch(err){
                    console.log(err)
                }
            }
        )()

        //listener used to add the latest message to the "message" state so it can be displayed
        socket.on("receiveMessage", message => {
            //add new message to state
            setMessages(prevMessages => [...prevMessages, message])
        })

        return () => {
            socket.off("receiveMessage")
        }

    },[])

    //fetch messages between current user and selected friend (currentChat)
    useEffect(() => {
        (
            async() => {
                try{
                    //get id token
                    const token = await user.getIdToken()
                    //make api call to fetch the firsy 20 messages between current user and other user
                    const { data } = await axiosInstance.get(`/api/chat/${currentChat.username}/messages`, { 
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        params: {
                            page,
                            limit: 20
                        }
                    })

                    //case the server responds
                    if(data){
                        //update state with all messages
                        setMessages(data)

                        //case the array of messages has a length less than 20
                        if(data.length < 20){
                            //update state to stop infinite scrolling as there are no more messages to fetch
                            setHasMoreMessages(false)
                        }
                    }
                }catch(err){
                    console.log(err)
                }
            }
        )()
    }, [currentChat])

    //scroll to the bottom every time a new message appears
    useEffect(() => {
        //if the div containing the messages is rendered
        if(chatWindowRef.current){
            //scroll to the bottom
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
        }
    },[messages])

    //set up intersection observer and track the oldest message
    useEffect(() => {
        if(loading) return
        //prevent more than one observer from being active
        if(observer.current) observer.current.disconnect()
        
        //create a new intersection observer that will increase the page state
        //when the oldest message intersects with the viewport
        observer.current = new IntersectionObserver( entries => {
            if(entries[0].isIntersecting && hasMoreMessages) {
                //update state
                setPage(prevPage => prevPage + 1)
            }
        })

        //make the observer watch the oldest message
        if(oldestMessageRef.current) observer.current.observe(oldestMessageRef.current)
    })

    const joinRoom = (friend) => {
        setCurrentChat({username: friend.username, uid: friend.uid})
        socket.emit("joinRoom", friend.uid)
    }

    //method used to create a new message in db and send it to users
    const sendMessage = () => {
        //case there is a message and the user has selected a chat room
        if(newMessage.trim() && currentChat) {
            //create the message object
            const message = {
                content: newMessage,
                receiverUid: currentChat.uid,
            }

            //emit message
            socket.emit("sendMessage", message)
            //update state so the old message is deleted
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
                        filteredFriends.map((friend, index) => (
                            <ChatFriendCard {...friend} key={friend.uid + index} 
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

            <div ref={chatWindowRef}  className='h-full md:h-[586px] md:max-h-[586px] w-full flex flex-col items-start px-5 py-3 overflow-auto no-scrollbar gap-3'>
                {
                    messages.map((message, index) => (
                        <ChatMessageBubble {...message} key={message.id+index} sender={message.senderUid === user.uid ? "currentUser" : "otherUser"}/>
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