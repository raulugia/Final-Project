import React from 'react'
import Accuracy from "./Accuracy"


const SearchResultCard = ({ mealName, restaurantName, carbs, accuracy, date, totalLogs, imgUrl, type }) => {
  return (
    <>
      {type === "meal" ? (
        <div className="shadow-md bg-white text-slate-800 w-[70%] h-[185px] mx-auto py-4 px-4 flex gap-10 rounded-lg hover:cursor-pointer">
          <div className="w-[30%]">
            <img src={imgUrl} alt="" className="rounded-md w-full h-full" />
          </div>
          <div className="flex flex-col justify-between">
            <div className="flex flex-col justify-start items-start">
              <p className="text-xl font-semibold">{mealName}</p>
              <p className="text-sm">{restaurantName}</p>
            </div>
            <div className="flex flex-col justify-start items-start">
              <p className="text-md">Carb estimation: {carbs}g</p>
              {/* <p className="border rounded-sm px-1 text-sm">{accuracy}</p> */}
              <Accuracy accuracy={accuracy} />
            </div>
            <div className="flex flex-col justify-start items-start">
              <p className="mt-2 text-xs">Last log: {date}</p>
              <p className="text-xs">Number of logs: {totalLogs}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="shadow-md bg-white text-slate-800 w-[70%] mx-auto py-4 px-4 flex flex-col gap-5 rounded-lg hover:cursor-pointer">
            <p className="text-xl font-semibold">{restaurantName}</p>
            <p className="text-xs">Number of logs: {totalLogs}</p>
        </div>
      )}
    </>
  );
}

export default SearchResultCard