import React from 'react'
import { MdKeyboardArrowRight } from "react-icons/md";

//All the code in this file was written without assistance

//UI loading component

const SkeletonFriends = () => {
  return (
    <>
        <div className='shadow-md bg-slate-50 text-slate-800 w-[88%] md:w-[70%] h-32 mx-auto mt-4 py-4 px-4 flex items-center justify-between gap-5 rounded-lg'>
            <div className='flex gap-10 justify-start'>
                <div className="animate-pulse-fast bg-slate-300  rounded-full w-20 h-20"></div>

                <div className="my-auto flex md:flex-row flex-col  md:items-center">
                    <div className= "animate-pulse-fast bg-slate-300  h-5 w-28"></div>
                    <div className="mt-2 md:mt-0 md:ml-6 lg:ml-14 animate-pulse-fast bg-slate-300  h-4 w-20"></div>
                </div>
            </div>
            <MdKeyboardArrowRight size={40} className='animate-pulse-fast'/>
        </div>
        <div className='shadow-md bg-slate-50 text-slate-800 w-[88%] md:w-[70%] h-32 mx-auto mt-4 py-4 px-4 flex items-center justify-between gap-5 rounded-lg'>
            <div className='flex gap-10 justify-start'>
                <div className="animate-pulse-fast bg-slate-300  rounded-full w-20 h-20"></div>

                <div className="my-auto flex md:flex-row flex-col  md:items-center">
                    <div className= "animate-pulse-fast bg-slate-300  h-5 w-28"></div>
                    <div className="mt-2 md:mt-0 md:ml-6 lg:ml-14 animate-pulse-fast bg-slate-300  h-4 w-20"></div>
                </div>
            </div>
            <MdKeyboardArrowRight size={40} className='animate-pulse-fast'/>
        </div>
        <div className='shadow-md bg-slate-50 text-slate-800 w-[88%] md:w-[70%] h-32 mx-auto mt-4 py-4 px-4 flex items-center justify-between gap-5 rounded-lg'>
            <div className='flex gap-10 justify-start'>
                <div className="animate-pulse-fast bg-slate-300  rounded-full w-20 h-20"></div>

                <div className="my-auto flex md:flex-row flex-col  md:items-center">
                    <div className= "animate-pulse-fast bg-slate-300  h-5 w-28"></div>
                    <div className="mt-2 md:mt-0 md:ml-6 lg:ml-14 animate-pulse-fast bg-slate-300  h-4 w-20"></div>
                </div>
            </div>
            <MdKeyboardArrowRight size={40} className='animate-pulse-fast'/>
        </div>
    </>
  )
}

export default SkeletonFriends