import React, { useState, useRef, useEffect } from 'react'
import { MdKeyboardArrowRight } from "react-icons/md";
import { Link } from 'react-router-dom'

const FriendCard = ({ name, surname, username, profile_pic}) => {
    //flag to underline friend's name and surname if card is hovered
    const [isHovered, setIsHovered] = useState(null)

  return (
    <Link to={`/user/${username}`}
        onMouseEnter={() => setIsHovered(username)}
        onMouseLeave={() => setIsHovered(null)}
        className="shadow-md bg-slate-50 text-slate-800 w-[88%] md:w-[70%] mx-auto mt-4 py-4 px-4 flex items-center justify-between gap-5 rounded-lg"
    >
      <div className="flex items-center justify-between gap-10">
        <div>
          <div className="bg-slate-500 rounded-full w-20 h-20 overflow-hidden">
            {
              profile_pic && (
                <img src={profile_pic} alt="profile picture" />
              )
            }
          </div>
        </div>
        <div className='flex md:flex-row flex-col md:gap-20 md:items-center'>
          <p className={`text-md md:text-xl font-semibold text-slate-800 ${isHovered === username ? "underline" : ""}`}>{name} {surname}</p>
          <p className={"text-sm md:text-lg text-slate-400"}>@{username}</p>
        </div>
      </div>
      <div className="text-slate-800">
        <MdKeyboardArrowRight size={40} />
      </div>
    </Link>
  );
}

export default FriendCard