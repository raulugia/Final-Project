import React from 'react'
import { MdKeyboardArrowRight } from "react-icons/md";
import { Link } from 'react-router-dom'

const FriendCard = ({ name, surname, username, imgUrl}) => {
  return (
    <Link to={`/${username}`} className="shadow-md bg-slate-50 text-slate-800 w-[70%] mx-auto mt-4 py-4 px-4 flex items-center justify-between gap-5 rounded-lg">
      <div className="flex items-center justify-between gap-10">
        <div>
          <div className="bg-slate-500 rounded-full w-20 h-20"></div>
        </div>
        <div>
          <p className="text-xl font-semibold text-slate-800">{name} {surname}</p>
        </div>
      </div>
      <div className="text-slate-800">
        <MdKeyboardArrowRight size={40} />
      </div>
    </Link>
  );
}

export default FriendCard