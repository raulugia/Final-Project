import React, { useState, useEffect, useRef} from 'react'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'
import ChatFriendCard from '../components/ChatFriendCard'
import ChatMessageBubble from '../components/ChatMessageBubble'
import socket from "../../utils/socket"
import { VscSend } from "react-icons/vsc";

//All the code in this file was written without assistance 

const Chat = () => {
    //get current user
    const user = auth.currentUser
    //state to hold user's friends
    const [friends, setFriends] = useState([])
    //state to display messages between current user and selected friend
    const [messages, setMessages] = useState([])
    //state to store the typed in message
    const [newMessage, setNewMessage] = useState("")
    //state to display filtered friends
    const [filteredFriends, setFilteredFriends] = useState(friends)
    //state to enable/disable the send button - button will be disabled if no chatroom has been selected
    const [btnDisabled, setBtnDisabled] = useState(true)
    //state needed for responsiveness
    const [windowWidth, setWindowWidth] = useState(window.innerWidth)
    //flag to ensure only friends are displayed when the component rendered on small screens - when a friend is selected, the chats appear
    const [displayMessages, setDisplayMessages] = useState(window.innerWidth > 600)
    //state needed to join a chat room (websocket)
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
    //ref to scroll to the bottom of the chat container each time a new message appears
    const chatWindowRef = useRef()
    //state to show errors
    const [error, setError] = useState("")

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
                        //update states to display friends
                        setFriends(data)
                        setFilteredFriends(data)
                    }
                }catch(err) {
                    //update state to display an error message
                    if(err.response && err.response.data && err.response.data.error){
                        setError(err.response.data.error)
                    } else {
                        setError("Failed to load data. Please try again.")
                    }
                }
            }
        )()

        //listener used to add the latest message to the "message" state so it can be displayed
        socket.on("receiveMessage", message => {
            //format the timestamp
            const formattedMessage = {...message, timestamp: formatTime(message.timestamp)} 
            //add new message to state
            setMessages(prevMessages => [...prevMessages, formattedMessage])
        })

        return () => {
            socket.off("receiveMessage")
        }

    },[])

    //method to change the messages timestamp format to hh:mm
    const formatTime = timestamp => {
        const date = new Date(timestamp)
        const hours = date.getHours().toString().padStart(2, "0")
        const minutes = date.getMinutes().toString().padStart(2, "0")

        return `${hours}:${minutes}`
    }

    //fetch messages between current user and selected friend (currentChat)
    useEffect(() => {
        setLoading(false)
        if(currentChat && currentChat.username){
            (
                async() => {
                    try{
                        setLoading(true)
                        setError("")
                        //get id token
                        const token = await user.getIdToken()
                        //make api call to fetch the first 20 messages between current user and other user
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
                            const displayMessages = data.map(message => ({...message, timestamp: formatTime(message.timestamp)}))
                            //update state with newly fetched messages
                            setMessages(prevMessages => [...displayMessages, ...prevMessages])
                            setLoading(false)
                            //case the array of messages has a length less than 20
                            if(data.length < 20){
                                //update state to stop infinite scrolling as there are no more messages to fetch
                                setHasMoreMessages(false)
                            }
                        }
                    }catch(err) {
                        //update state to display an error message
                        if(err.response && err.response.data && err.response.data.error){
                            setError(err.response.data.error)
                        } else {
                            setError("Failed to load messages. Please try again.")
                        }
                    } finally {
                        //hide loading state
                        setLoading(false)
                    }
                }
            )()
        }
    }, [currentChat, page])

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
    }, [hasMoreMessages, loading, messages])

    //add event listener for responsiveness - screen resize
    useEffect(() => {
        const handleResize = () => { 
            setWindowWidth(window.innerWidth)
            //only show both friends and messages on medium/big screens
            setDisplayMessages(window.innerWidth > 600)
        }
        //add event listener to window
        window.addEventListener("resize", handleResize)

        return () => window.removeEventListener("resize", handleResize)
    },[])

    //method to join a room
    const joinRoom = (friend) => {
        //update state with other user details
        setCurrentChat({...friend})
        //update state to get rid of old messages
        setMessages([])
        //update state so new messages are fetched
        setHasMoreMessages(true)
        //update page state to reset infinite scrolling
        setPage(1)
        //enable send button so messages can be sent
        setBtnDisabled(false)

        if(windowWidth < 600){
            setDisplayMessages(true)
        }
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

    //method triggered by typing in the search bar - filter friends
    const handleInputChange = (e) => {
        //store input value
        const searchValue = e.target.value

        //if friends were found
        if(friends.length > 0) {
            //get the friends that match the search input
            const filtered = friends.filter(friend => {
                return `${friend.name} ${friend.surname} ${friend.username}`.toLowerCase().includes(searchValue.toLowerCase())
            })

            //update state so the filtered friends are displayed
            setFilteredFriends(filtered)
        }
    }

  return (
    <div className="flex min-h-screen pb-28 justify-center px-5 max-h-[675px]">
        {
            error && (
                <div className="absolute top-[65px] bg-red-100 border border-red-700 text-red-900 px-3 py-1 rounded-md font-semibold">
                    <p>{error}</p>
                </div>
            )
        }
        {/* Left side */}
        <div className={`mt-28 flex flex-col border rounded-l-lg bg-white shadow-md w-full ${windowWidth < 600 ? "rounded-lg" : "max-w-[395px]"} ${displayMessages && windowWidth < 600 ? "hidden" : ""}`}>
            <div className="w-full flex items-center justify-center border-b-2 min-h-[75px]">
                <input type="text" onChange={handleInputChange} className='bg-gray-100 w-full border py-2 mx-4 rounded-xl px-3' placeholder='Search Friend...'/>
            </div>
            <div className="w-full h-full flex flex-col overflow-scroll no-scrollbar">
                {   
                    filteredFriends.length > 0 && (
                        filteredFriends.map((friend, index) => (
                            <ChatFriendCard {...friend} key={friend.uid + index} currentChat={currentChat}
                                joinRoom={() => joinRoom(friend)}
                            />
                        ))
                    )
                }
            </div>
        </div>

        {/* Right side  */}
        <div className={`mt-28 flex flex-col bg-white border w-full max-w-[680px] rounded-r-lg shadow-md ${windowWidth < 600 && !displayMessages ? "hidden" : ""}`}>
            <div className='border-b-2 min-h-[75px]'>
                {
                    currentChat && (
                        <div className='h-full px-5 ml-4 flex items-center justify-start gap-3'>
                            <button className='md:hidden' onClick={() => setDisplayMessages(false)}>Back</button>
                            <div className='flex flex-col justify-center h-full'>
                                <p className='text-lg font-bold text-slate-700'>{currentChat.name} {currentChat.surname}</p>
                                <p className='text-sm'>@{currentChat.username}</p>
                            </div>
                        </div>
                    )
                }
            </div>

            {/* Messages display */}
            <div ref={chatWindowRef}  className={`h-full w-full flex flex-col items-start px-5 py-3 overflow-auto no-scrollbar relative gap-3`}>
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
                                <svg aria-hidden="true" className="inline w-6 h-6 text-gray-200 animate-spin fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                                </svg>
                                <p className='text-md text-white'>Loading...</p>
                            </div>
                        </div>
                    )
                }
            </div>

            {/* Type & send */}
            <div className='w-full h-[70px] mt-auto flex items-center gap-2 px-4'>
                <input type="text" placeholder='Type your message...' 
                    className='bg-gray-100 w-full border rounded-xl py-2 px-3'
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" ? sendMessage() : ""}
                    value={newMessage}
                />
                <button className='py-5' disabled={btnDisabled} onClick={sendMessage}><VscSend size={35} className={`px-1 py-1 bg-blue-600 text-white rounded-lg ${btnDisabled ? "" : "hover:bg-blue-500 hover:cursor-pointer"}`}/></button>
            </div>
        </div>
    </div>
  )
}

export default Chat