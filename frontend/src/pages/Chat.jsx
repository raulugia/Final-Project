import React, { useState, useEffect, useRef} from 'react'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'
import ChatFriendCard from '../components/ChatFriendCard'
import ChatMessageBubble from '../components/ChatMessageBubble'
import socket from "../../utils/socket"
//import { disconnect } from 'process'


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
            setMessages(prevMessages => [...prevMessages, ...message])
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
                    setLoading(true)
                    console.log("FETCHING...",  page)
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
                        console.log(data.reverse())
                        //update state with newly fetched messages
                        setMessages(prevMessages => [...data, ...prevMessages])
                        setLoading(false)
                        //case the array of messages has a length less than 20
                        if(data.length < 20){
                            //update state to stop infinite scrolling as there are no more messages to fetch
                            setHasMoreMessages(false)
                        }
                    }
                }catch(err){
                    console.log(err)
                    setLoading(false)
                }
            }
        )()
    }, [currentChat, page])

    //scroll to the bottom every time a new message appears
    useEffect(() => {
        //if the div containing the messages is rendered
        if(chatWindowRef.current){
            //scroll to the bottom
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
        }
    },[messages])

    useEffect(() => {
        if(observer.current){
            console.log("OBSERVER", observer.current)
        }
    }, [observer.current])

    useEffect(() => {
        if(oldestMessageRef.current){
            console.log("REF", oldestMessageRef.current)
        }
    }, [oldestMessageRef.current])

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
        console.log("oldest mess", oldestMessageRef)
    }, [hasMoreMessages, loading, messages])

    //method to join a room
    const joinRoom = (friend) => {
        //update state with other user details
        setCurrentChat({username: friend.username, uid: friend.uid})
        //update state to get rid of old messages
        setMessages([])
        //update state so new messages are fetched
        setHasMoreMessages(true)
        //update page state to reset infinite scrolling
        setPage(1)

        //emit joinRoom with other user uid
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

            <div ref={chatWindowRef}  className='h-full md:h-[586px] md:max-h-[586px] w-full flex flex-col items-start px-5 py-3 overflow-auto no-scrollbar relative gap-3'>
                {
                    messages.map((message, index) => (
                        <ChatMessageBubble 
                            {...message} key={message.id+index} 
                            sender={message.senderUid === user.uid ? "currentUser" : "otherUser"}
                            ref={index === 0 ? oldestMessageRef : null}
                        />
                    ))
                }

                {
                    loading&&(
                        <div className='w-full h-full flex items-start justify-center absolute inset-0'>
                            <div className='flex gap-2 mt-8 bg-gray-400 py-1 px-2 rounded-md'>
                                <svg aria-hidden="true" class="inline w-6 h-6 text-gray-200 animate-spin fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                </svg>
                                <p className='text-md text-white'>Loading...</p>
                            </div>
                        </div>
                    )
                }
            </div>

            <div className='w-full h-[70px] border mt-auto flex items-center gap-3 px-4'>
                <input type="text" placeholder='Type your message...' 
                    className='bg-gray-100 w-full border rounded-xl py-2 px-3'
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" ? sendMessage() : ""}
                    value={newMessage}
                />
                <button className='border' onClick={sendMessage}>Send</button>
            </div>
        </div>
    </div>
  )
}

export default Chat