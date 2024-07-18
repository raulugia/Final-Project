import React from 'react'
import { MdKeyboardArrowRight } from "react-icons/md";

const SkeletonMealLogCard = () => {
  return (
    <>
    <div className='shadow-md bg-slate-50 text-slate-800 w-[70%] h-32 mx-auto mt-4 py-4 px-4 flex items-center justify-between gap-5 rounded-lg'>
      <div className='flex gap-10 justify-start'>
        <div className="flex flex-col animate-pulse-fast bg-slate-300  h-24 w-24 rounded-md"></div>
        <div className='flex flex-col mt-3 gap-1'>
            <div className="flex gap-3">
                <div className="flex flex-col animate-pulse-fast bg-slate-300  h-5 w-28"></div>
                <div className="flex flex-col animate-pulse-fast bg-slate-300  h-5 w-4"></div>
            </div>
            <div className="flex flex-col animate-pulse-fast bg-slate-300  h-6 w-16"></div>
            <div className="flex flex-col animate-pulse-fast bg-slate-300  h-3 w-22 mt-5"></div>
        </div>
      </div>
        <MdKeyboardArrowRight size={40} className='animate-pulse-fast'/>
    </div>
    
    <div className='shadow-md bg-slate-50 text-slate-800 w-[70%] h-32 mx-auto mt-4 py-4 px-4 flex items-center justify-between gap-5 rounded-lg'>
      <div className='flex gap-10 justify-start'>
        <div className="flex flex-col animate-pulse-fast bg-slate-300  h-24 w-24 rounded-md"></div>
        <div className='flex flex-col mt-3 gap-1'>
            <div className="flex gap-3">
                <div className="flex flex-col animate-pulse-fast bg-slate-300  h-5 w-28"></div>
                <div className="flex flex-col animate-pulse-fast bg-slate-300  h-5 w-4"></div>
            </div>
            <div className="flex flex-col animate-pulse-fast bg-slate-300  h-6 w-16"></div>
            <div className="flex flex-col animate-pulse-fast bg-slate-300  h-3 w-22 mt-5"></div>
        </div>
      </div>
        <MdKeyboardArrowRight size={40} className='animate-pulse-fast'/>
    </div>

    <div className='shadow-md bg-slate-50 text-slate-800 w-[70%] h-32 mx-auto mt-4 py-4 px-4 flex items-center justify-between gap-5 rounded-lg'>
      <div className='flex gap-10 justify-start'>
        <div className="flex flex-col animate-pulse-fast bg-slate-300  h-24 w-24 rounded-md"></div>
        <div className='flex flex-col mt-3 gap-1'>
            <div className="flex gap-3">
                <div className="flex flex-col animate-pulse-fast bg-slate-300  h-5 w-28"></div>
                <div className="flex flex-col animate-pulse-fast bg-slate-300  h-5 w-4"></div>
            </div>
            <div className="flex flex-col animate-pulse-fast bg-slate-300  h-6 w-16"></div>
            <div className="flex flex-col animate-pulse-fast bg-slate-300  h-3 w-22 mt-5"></div>
        </div>
      </div>
        <MdKeyboardArrowRight size={40} className='animate-pulse-fast'/>
    </div>
    
    </>
  )
}

export default SkeletonMealLogCard