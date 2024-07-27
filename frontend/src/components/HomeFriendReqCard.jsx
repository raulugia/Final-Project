import React from 'react'
import { Link } from 'react-router-dom'
import { TiTick } from "react-icons/ti";
import { MdOutlineClose } from "react-icons/md";
import axiosInstance from '../../utils/axiosInstance';
import { auth } from '../../utils/firebase';

const HomeFriendReqCard = ({name, surname, username, image, userId, requestId}) => {
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
        }catch(err) {
            console.error(err)
        }
    }
  return (
    <Link to={`/user/${userId}`} className='flex gap-4 border-y border-slate-200 w-full px-3 py-1'>

        <div>
            <div className="h-10 w-10 rounded-full bg-slate-700"></div>
        </div>

        <div className='flex gap-2 items-center'>
        <p>{name}{surname}</p>
        <p className='text-sm'>@{username}</p>
        </div>

        <div className='flex gap-2 items-center'>
            <TiTick 
                size={25} className='border bg-blue-600 text-white rounded-md'
                onClick={() => handleRequest("accept", requestId)}
            />
            <MdOutlineClose 
                size={25} className='border bg-red-500 text-white rounded-md'
                onClick={() => handleRequest("reject", requestId)}
            />
        </div>
    </Link>
  )
}

export default HomeFriendReqCard