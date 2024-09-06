import React from 'react'
import { GiHotMeal } from "react-icons/gi";
import { MdOutlineRestaurant } from "react-icons/md";
import { RiMessage2Line } from "react-icons/ri";
import { FaUserFriends } from "react-icons/fa";
import { Link } from 'react-router-dom'

//All the code in this file was written without assistance

//UI component

const ProfileCard = ({name, surname, username, profilePicUrl}) => {
  return (
    <div className='flex flex-col bg-white py-5 sticky px-5 top-[138px] rounded-lg shadow-md border border-sky-700'>
        <div className='flex gap-10 items-center'>
            <div className='bg-slate-700 w-24 h-24 rounded-full overflow-hidden'>
                {
                    profilePicUrl && (
                        <img src={profilePicUrl} alt="profile picture" />
                    )
                }
            </div>
            <div>
                <p className='text-2xl text-sky-900 font-semibold'>{name} {surname}</p>
                <p className='text-slate-400'>@{username}</p>
            </div>
        </div>

        <div className='flex flex-col mt-16 text-xl text-sky-900'>
        <Link to={`/user/${username}/meals`} className='flex items-start gap-2 border-y-2 border-slate-300 py-2'>
            <GiHotMeal />
            <p>Meals</p>
        </Link>
        <Link to={`/user/${username}/restaurants`} className='flex items-center gap-3 border-b-2 border-slate-300 py-2'>
            <MdOutlineRestaurant />
            <p>Restaurants</p>
        </Link>
        <Link to={`/user/${username}/friends`} className='flex items-center gap-3 border-b-2 border-slate-300 py-2'>
            <FaUserFriends />
            <p>Friends</p>
        </Link>
        </div>

        <div className='mt-16 w-full'>
            <Link to={`/chats/`} className='w-full flex gap-2 justify-center items-center border rounded-md bg-blue-600 hover:bg-blue-700 py-1'>
                <RiMessage2Line className='text-white' size={24}/>
                <p className='text-xl text-white font-semibold'>Message</p>
            </Link>
        </div>
    </div>
  )
}

export default ProfileCard