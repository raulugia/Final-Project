import React from 'react'
import Accuracy from "./Accuracy"
import { MdKeyboardArrowRight } from "react-icons/md";
import { Link } from 'react-router-dom';


const SearchResultCard = ({ mealName, restaurantName, carbs, accuracy, date, totalLogs, imgUrl, type }) => {
  return (
    <>
      {type === "meal"  ? (
        <Link to={""} className="shadow-md bg-slate-50 text-slate-800 w-[88%] md:w-[70%] h-[185px] mx-auto py-4 px-4 flex gap-10 rounded-lg hover:cursor-pointer">
          <div className="hidden md:block md:w-[30%]">
            <img src={imgUrl} alt="" className="rounded-md w-full h-full" />
          </div>
          <div className="flex flex-col justify-between">
            <div className="flex flex-col justify-start items-start">
              <p className="text-xl font-semibold">{mealName}</p>
              <p className="text-sm">{restaurantName}</p>
            </div>

            <div className="flex flex-col justify-start items-start">
              <p className="text-md">Carb estimation: {carbs}g</p>
              <Accuracy accuracy={accuracy} />
            </div>

            <div className="flex flex-col justify-start items-start">
              <p className="mt-2 text-xs">Last log: {date}</p>
              <p className="text-xs">Number of logs: {totalLogs}</p>
            </div>
          </div>
          <div className='my-auto ml-auto'>
            <MdKeyboardArrowRight size={40} />
          </div>
        </Link>
      ) : (
        <Link to={""} className="shadow-md bg-slate-50 text-slate-800 w-[88%] md:w-[70%] mx-auto py-4 px-4 flex items-center justify-between gap-5 rounded-lg hover:cursor-pointer">
            <div className='flex flex-col'>
                <p className="text-xl font-semibold">{restaurantName}</p>
                <p className="text-xs">Number of logs: {totalLogs}</p>
            </div>
            <div>
                <MdKeyboardArrowRight size={40} />
            </div>
        </Link>
      )}
    </>
  );
}

export default SearchResultCard