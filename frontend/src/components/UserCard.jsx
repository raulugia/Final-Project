import React, {useState, useEffect, useRef} from 'react'
import { Link } from 'react-router-dom'
import { MdKeyboardArrowRight } from "react-icons/md";
import { auth } from '../../utils/firebase';
import axiosInstance from '../../utils/axiosInstance';

//All the code in this file was written without assistance

//UI component rendered in search results

const UserCard = ({username, name, surname, isFriend, uid, friendRequestStatus, requestId, profile_pic}) => {
    //get current user
    const user = auth.currentUser
    const [isHovered, setIsHovered] = useState(null)
    const [buttonMessage, setButtonMessage] = useState("")
    const [displayRequestOptions, setDisplayRequestOptions] = useState(false)
    //control when a button should be disabled
    const [isDisabled, setIsDisabled] = useState(false)

    //code to set the set of the card button
    useEffect(() => {
        //case users are not friends and there are no friend requests between them or the friend request was rejected
        if(!isFriend && (!friendRequestStatus || friendRequestStatus === "rejected")) {
            //set button text to "Add Friend"
            setButtonMessage("Add Friend")
        //case users are not friends and there is a pending friend request sent by current user    
        } else if(!isFriend && friendRequestStatus === "pending") {
            //set button text to "Pending..." and siable it
            setButtonMessage("Pending...")
            setIsDisabled(true)
        //case users are not friends and there is a pending friend request received by current user    
        } else if(!isFriend && friendRequestStatus === "action") {
            //display the action buttons to accept/reject the friend request
            setDisplayRequestOptions(true)
        //case users are friends    
        } else {
            setButtonMessage("Message")
        }
    }, [isFriend, friendRequestStatus])

    //method to handle button click
    const handleClick = async(e) => {
        e.preventDefault()

        //case the user is not a friend
        if(buttonMessage === "Add Friend") {
            //get token for authentication in the server 
            const token = await user.getIdToken();

            try {
                //update the button message to "Pending..." and disable it
                setButtonMessage("Pending...")
                setIsDisabled(true)

                //send api call to create a friend request 
                const response = await axiosInstance.post("/api/friend-request", 
                    { recipientUid: uid }, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
                
            } catch (err) {
                //if there was an error, reset button to its original form
                setButtonMessage("Add Friend")
                setIsDisabled(false)
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
                    //display Message button
                    setButtonMessage("Message")
                //case user rejected the friend request    
                } else if(action === "reject") {
                    //display Add Friend button
                    setButtonMessage("Add Friend")
                }
                //reset states
                setDisplayRequestOptions(false)
                setIsDisabled(false)
            }
        }catch(err) {
            //error
            setDisplayRequestOptions(false)
            setButtonMessage("Error. Try again.")
            setIsDisabled(true)
        }
    }

  return (
    <div
        onMouseEnter={() => setIsHovered(username)}
        onMouseLeave={() => setIsHovered(null)}
        className="shadow-md bg-slate-50 text-slate-800 w-[88%] md:w-[70%] mx-auto mt-4 py-4 pl-4 pr-1 flex items-center justify-between gap-5 rounded-lg"
    >   
        <div className="flex items-center flex-grow justify-between">
            <div className="flex items-center justify-between gap-2 md:gap-10">
                <div>
                    <div className="bg-slate-500 rounded-full w-14 h-14 md:w-20 md:h-20 overflow-hidden">
                   
                        <img src={profile_pic ? profile_pic : "../../public/user.png"} alt="profile picture" />
                    </div>
                </div>
                <Link to={`/user/${username}`} className='flex flex-col items-center'>
                    <p className={`text-sm md:text-xl font-semibold text-slate-800 ${isHovered === username ? "underline" : ""}`}>{name} {surname}</p>
                    <p className={"text-sm md:text-lg text-slate-400"}>@{username}</p>
                </Link>
            </div>
            <div className="md:mr-10">
                {
                    displayRequestOptions ? (
                        <div className="flex md:flex-row flex-col gap-3">
                            <button onClick={() => handleRequest("accept", requestId)} id="acceptBtn" className='text-sm md:text-md px-2 rounded-md text-white bg-blue-600 hover:bg-blue-500 hover:shadow-sm'>Accept</button>
                            <button onClick={() => handleRequest("reject", requestId)} id="rejectBtn" className='text-sm md:text-md border px-2 rounded-md bg-slate-200 hover:bg-slate-300 hover:shadow-sm'>Reject</button>
                        </div>
                    ) : (
                        <button disabled={isDisabled} onClick={handleClick} className='text-sm md:text-md border px-2 py-1 rounded-md hover:bg-slate-100 hover:shadow-sm disabled:bg-gray-200'>{buttonMessage}</button>
                    )
                }
            </div>
            <Link to={`/user/${username}`} className="text-slate-800">
                <MdKeyboardArrowRight size={40} />
            </Link>
        </div>
</div>
  )
}

export default UserCard