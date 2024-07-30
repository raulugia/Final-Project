import React from 'react'
import { GiHotMeal } from "react-icons/gi";
import { MdOutlineRestaurant } from "react-icons/md";
import { RiMessage2Line } from "react-icons/ri";
import { FaUserFriends } from "react-icons/fa";
import { Link } from 'react-router-dom'


const ProfileCard = ({name, surname, username}) => {
  return (
    <div className='flex flex-col bg-white py-5 sticky px-5 top-[138px] rounded-lg shadow-md'>
        <div className='flex gap-10 items-center'>
            <div className='bg-slate-700 w-24 h-24 rounded-full'></div>
            <div>
                <p className='text-2xl text-slate-700 font-semibold'>{name} {surname}</p>
                <p className='text-slate-400'>@{username}</p>
            </div>
        </div>

        <div className='flex flex-col mt-16 text-xl text-slate-700'>
        <Link to={`/user/${username}/meals`} className='flex items-start gap-2 border-y-2 border-slate-200 py-2'>
            <GiHotMeal />
            <p>Meals</p>
        </Link>
        <Link to={`/user/${username}/restaurants`} className='flex items-center gap-3 border-b-2 border-slate-200 py-2'>
            <MdOutlineRestaurant />
            <p>Restaurants</p>
        </Link>
        <Link to={`/user/${username}/friends`} className='flex items-center gap-3 border-b-2 border-slate-200 py-2'>
            <FaUserFriends />
            <p>Friends</p>
        </Link>
        </div>

        <div className='mt-16 w-full'>
            <Link to={`chats/${username}`} className='w-full flex gap-2 justify-center items-center border rounded-md bg-blue-600 hover:bg-blue-700 py-1'>
                <RiMessage2Line className='text-white' size={24}/>
                <p className='text-xl text-white font-semibold'>Message</p>
            </Link>
        </div>
    </div>
  )
}

export default ProfileCard