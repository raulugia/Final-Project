import React, {useState} from 'react'
import { Link } from 'react-router-dom'
import { TiTick } from "react-icons/ti";
import { MdOutlineClose } from "react-icons/md";
import axiosInstance from '../../utils/axiosInstance';
import { auth } from '../../utils/firebase';
import { useStateContext } from '../context/ContextProvider'

//All the code in this file was written without assistance 

//this represents every pending friend request rendered in Home

const HomeFriendReqCard = ({name, surname, username, requestId, profile_pic}) => {
    //get current user
    const user = auth.currentUser
    //get method from context  to update state containing friend requests
    const { setPendingRequests } = useStateContext()
    const [error, setError] = useState("")

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

            //case request handled successfully - remove it from the array of friend requests so it is not displayed
            if(response.status === 200) {
                setPendingRequests(prevPendingRequests => prevPendingRequests.filter(req => req.id !== requestId ))
            }
        }catch(err) {
           //update state to display an error message
           if(err.response && err.response.data && err.response.data.error){
            setError(err.response.data.error)
            } else {
                setError("Failed to load friends. Please try again later.")
            }
        }
    }

  return (
    <div className='flex justify-between border-y border-slate-200 w-full px-3 py-1'>

        {
            error ? (
                <div className='w-100 text-red-900 font-semibold text-sm'>
                    <p>{error}</p>
                </div>
            ) : (
                <>
                <div className="flex gap-2">
                <Link to={`/user/${username}`}>
                    <div className="h-10 w-10 rounded-full bg-slate-700 overflow-hidden">
                        <img src={profile_pic ? profile_pic : "../../public/user.png"} alt="profile picture" />
                    </div>
                </Link>

                <Link to={`/user/${username}`} className='flex gap-2 items-center'>
                    <p>{name} {surname}</p>
                </Link>
                </div>
                <div className='flex gap-2 items-center'>
                    <TiTick 
                        size={25} className='border bg-blue-600 text-white rounded-md hover:bg-blue-800 hover:shadow-sm hover:cursor-pointer'
                        onClick={() => handleRequest("accept", requestId)}
                    />
                    <MdOutlineClose 
                        size={25} className='border bg-red-500 text-white rounded-md hover:bg-red-700 hover:shadow-sm hover:cursor-pointer'
                        onClick={() => handleRequest("reject", requestId)}
                    />
                </div>
                </>
            )
        }

    </div>
  )
}

export default HomeFriendReqCard