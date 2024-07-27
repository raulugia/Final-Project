import React from 'react'
import { Link } from 'react-router-dom'
import { TiTick } from "react-icons/ti";
import { MdOutlineClose } from "react-icons/md";

const HomeFriendReqCard = ({name, surname, username, image, userId}) => {
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
            <TiTick size={25} className='border bg-blue-600 text-white rounded-md'/>
            <MdOutlineClose size={25} className='border bg-red-500 text-white rounded-md'/>
        </div>
    </Link>
  )
}

export default HomeFriendReqCard