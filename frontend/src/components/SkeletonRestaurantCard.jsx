import React from 'react'
import { MdKeyboardArrowRight } from "react-icons/md";

const SkeletonRestaurantCard = () => {
  return (
    <>
    <div data-testid="skeleton-restaurant-card" className="shadow-md bg-slate-50 text-slate-800 w-[70%] mx-auto py-4 px-4 flex items-center justify-between gap-5 rounded-lg hover:cursor-pointer">
      <div className="flex gap-5">
        <div className="flex flex-col animate-pulse-fast bg-slate-300  h-5 w-20"></div>
        <div className="flex flex-col animate-pulse-fast bg-slate-300  h-5 w-28"></div>
      </div>
      <div>
        <MdKeyboardArrowRight size={40} className='animate-pulse-fast'/>
      </div>
    </div>
    
    <div data-testid="skeleton-restaurant-card" className="shadow-md bg-slate-50 text-slate-800 w-[70%] mx-auto py-4 px-4 flex items-center justify-between gap-5 rounded-lg hover:cursor-pointer">
      <div className="flex flex-col animate-pulse-fast bg-slate-300  h-5 w-48"></div>
      <div>
        <MdKeyboardArrowRight size={40} className='animate-pulse-fast'/>
      </div>
    </div>

    <div data-testid="skeleton-restaurant-card" className="shadow-md bg-slate-50 text-slate-800 w-[70%] mx-auto py-4 px-4 flex items-center justify-between gap-5 rounded-lg hover:cursor-pointer">
      <div className="flex flex-col animate-pulse-fast bg-slate-300  h-5 w-36"></div>
      <div>
        <MdKeyboardArrowRight size={40} className='animate-pulse-fast'/>
      </div>
    </div>
    </>
  );
}

export default SkeletonRestaurantCard