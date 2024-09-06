import React from 'react'
import { MdKeyboardArrowRight } from "react-icons/md";

//All the code in this file was written without assistance 

//UI component

const CommonRestaurantCard = ({ name }) => {
  return (
    <div className="flex w-full border pl-3 pr-1 py-2">
        <p className="text-md">{name}</p>
        <div className="ml-auto">
            <MdKeyboardArrowRight size={25}/>
        </div>
    </div>
  )
}

export default CommonRestaurantCard