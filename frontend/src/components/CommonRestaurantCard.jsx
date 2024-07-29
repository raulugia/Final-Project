import React from 'react'
import { MdKeyboardArrowRight } from "react-icons/md";

const CommonRestaurantCard = ({ name }) => {
  return (
    <div className="flex w-full border pl-3 pr-1">
        <p className="text-md">{name}</p>
        <div className="ml-auto">
            <MdKeyboardArrowRight size={25}/>
        </div>
    </div>
  )
}

export default CommonRestaurantCard