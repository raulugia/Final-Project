import React, { useState, useEffect } from 'react'
import { MdKeyboardArrowRight } from "react-icons/md";
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../../utils/firebase';
import axiosInstance from '../../utils/axiosInstance';

//All the code in this file was written without assistance 

//Component that simulates a profile with placeholders - users are not friends

const NotFriendsProfile = ({name, surname, otherUserUid, requestStatus, requestId}) => {
    //get current user
    const user = auth.currentUser
    //extract username
    const { username } = useParams()
    //state to set the button message and action
    const [buttonMessage, setButtonMessage] = useState(requestStatus === "pending" ? "Pending..." : "Add Friend")
    //state to store the fetched friend request
    const [friendRequest, setFriendRequest] = useState(requestStatus)
    //state to enable/disable buttons
    const [isDisabled, setIsDisabled] = useState(requestStatus === "pending")
    //state to display errors
    const [error, setError] = useState("")
    const navigate = useNavigate()

    //method to send a friend request
    const handleClick = async(e) => {
        e.preventDefault()
        //get token for authentication in the server 
        const token = await user.getIdToken();
        //reset error
        setError("")
        try {
            //update the button message to "Pending..." and disable it
            setButtonMessage("Pending...")
            setIsDisabled(true)

            //send api call to create a friend request 
            const response = await axiosInstance.post("/api/friend-request", 
                { recipientUid: otherUserUid }, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            
        } catch (err) {
            //if there was an error, reset button to its original form
            setButtonMessage("Add Friend")
            //display error
            if(err.response && err.response.data && err.response.data.error){
                setError(err.response.data.error)
            } else {
                setError("Internal server error. Please try again.")
            }
        }
    }

    //method to accept/reject a friend request
    const handleRequest = async (action, requestId) => {
        //get token for authentication in the server 
        const token = await user.getIdToken();

        try{
            //api call to accept or reject a friend request passing the token for authentication in the server
            const response = await axiosInstance.post(`api/friend-request/${action}/${requestId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            
            //hide the buttons to action the friend request and display the "Message" button if
            //the request was accepted successfully
            if(response.status === 200){
                //case user accepted the friend request
                if(action === "accept"){
                    //refresh page
                    navigate(0)
                //case user rejected the friend request    
                } else if(action === "reject") {
                    setFriendRequest("rejected")
                    //display Add Friend button
                    setButtonMessage("Add Friend")
                }
                //reset states
                setIsDisabled(false)
            }
        }catch(err) {
            //display error
            if(err.response && err.response.data && err.response.data.error){
                setError(err.response.data.error)
            } else {
                setError("Internal server error. Please try again.")
            }
        }
    }

  return (
    <div className='grid grid-cols-1 md:grid-cols-[1fr_1.4fr_1fr] min-h-screen pb-16 bg-slate-200'>
      <div className="md:flex md:flex-col border hidden">
        
        <div className='flex flex-col bg-white py-5 sticky px-5 top-[138px] rounded-lg shadow-md'>
            <div className='flex gap-10 items-center'>
                <div className='bg-slate-700 w-24 h-24 rounded-full'></div>
                <div>
                    <p className='text-2xl text-slate-700 font-semibold'>{name} {surname}</p>
                    <p className='text-slate-400'>@{username}</p>
                </div>
            </div>

            <div className='flex items-center justify-center py-8 px-2 outline bg-slate-200 mt-16 rounded-md'>
                <p className='text-sm font-semibold'>Befriend <span className='underline'>@{username}</span> to view their profile</p>
            </div>

            <div className='mt-16 w-full'>
                {
                    error && (
                        <div className='mb-4 border border-red-700 py-2 px-3 rounded-md bg-red-100 text-red-900 font-semibold'>
                            <p>{error}</p>
                        </div>
                    )
                }
                 {
                    friendRequest === "action" ? (
                        <div className="flex flex-col gap-3">
                            <button onClick={() => handleRequest("accept", requestId)} id="acceptBtn" className='text-lg px-2 py-1 rounded-md text-white bg-blue-600 hover:bg-blue-500 hover:shadow-sm'>Accept</button>
                            <button onClick={() => handleRequest("reject", requestId)} id="rejectBtn" className='text-lg border px-2 py-1 rounded-md bg-slate-200 hover:bg-slate-300 hover:shadow-sm'>Reject</button>
                        </div>
                    ) : (
                        <button 
                            onClick={handleClick}
                            className={`w-full flex gap-2 justify-center items-center text-xl font-semibold border rounded-md py-1 ${isDisabled ? "bg-gray-300 text-black" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
                            disabled={isDisabled}
                        >
                            {buttonMessage}
                        </button>
                    )
                }
            </div>
        </div>

      </div>

        <div className='flex flex-col gap-4 px-5 mt-20'>
          <h1 className='text-2xl font-bold text-slate-700 mb-2'>Recent Logs</h1>
          <div className='flex flex-col gap-5'>
            
            <div className='py-4 px-5 rounded-md border border-slate-200 shadow-md max-w-[456px] bg-white'>
                <div className='min-w-full max-w-[415px] min-h-[370px] rounded-md overflow-hidden bg-slate-700'></div>
                <div className='mt-4'>
                    <div className='flex justify-between items-center'>
                        <div className='flex flex-col gap-2'>
                            <div className='bg-slate-300  h-5 w-28'></div>
                            <div className='bg-slate-300  h-3 w-16'></div>
                        </div>
                        <div>
                            <div className='bg-slate-300  h-5 w-20'></div>
                        </div>
                    </div>
                </div>
                <div className='flex justify-end mt-2'>
                    <div className='bg-slate-300  h-3 w-36'></div>
                </div>
            </div>
            <div className='py-4 px-5 rounded-md border border-slate-200 shadow-md max-w-[456px] bg-white'>
                <div className='min-w-full max-w-[415px] min-h-[370px] rounded-md overflow-hidden bg-slate-700'></div>
                <div className='mt-4'>
                    <div className='flex justify-between items-center'>
                        <div className='flex flex-col gap-2'>
                            <div className='bg-slate-300  h-5 w-28'></div>
                            <div className='bg-slate-300  h-3 w-16'></div>
                        </div>
                        <div>
                            <div className='bg-slate-300  h-5 w-20'></div>
                        </div>
                    </div>
                </div>
                <div className='flex justify-end mt-2'>
                    <div className='bg-slate-300  h-3 w-36'></div>
                </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block">
            <div className='bg-white pt-1 sticky top-[138px] rounded-md shadow-md overflow-hidden'>
                <div className='flex gap-2 items-center px-3 py-2'>
                    <div className="flex flex-col  bg-slate-400  h-6 w-32"></div>
                </div>
                <div className="flex items-center w-full border pl-3 pr-1 py-1">
                    <div className="flex flex-col  bg-slate-300  h-3 w-16"></div>
                    <div className="ml-auto">
                        <MdKeyboardArrowRight size={25}/>
                    </div>
                </div>
                <div className="flex items-center w-full border pl-3 pr-1 py-1">
                    <div className="flex flex-col  bg-slate-300  h-3 w-16"></div>
                    <div className="ml-auto">
                        <MdKeyboardArrowRight size={25}/>
                    </div>
                </div>
                <div className="flex items-center w-full border pl-3 pr-1 py-1">
                    <div className="flex flex-col  bg-slate-300  h-3 w-16"></div>
                    <div className="ml-auto">
                        <MdKeyboardArrowRight size={25}/>
                    </div>
                </div>
            </div>
      </div>
    </div>
  )
}

export default NotFriendsProfile