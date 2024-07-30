import React from 'react'
import { GiHotMeal } from "react-icons/gi";
import { MdOutlineRestaurant } from "react-icons/md";
import { FaUserFriends } from "react-icons/fa";
import SkeletonHomeMealCard from './SkeletonHomeMealCard';
import { MdKeyboardArrowRight } from "react-icons/md";

const SkeletonProfile = () => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-[1fr_1.4fr_1fr] min-h-screen pb-16 bg-slate-200'>
      <div className="md:flex md:flex-col border hidden">
        
        <div className='flex flex-col bg-white py-5 sticky px-5 top-[138px] rounded-lg shadow-md'>
            <div className='flex gap-10 items-center'>
                <div className='bg-slate-700 w-24 h-24 rounded-full animate-pulse-fast'></div>
                <div>
                    <div className="flex flex-col animate-pulse-fast bg-slate-300  h-5 w-28"></div>
                    <div className="flex flex-col animate-pulse-fast bg-slate-300  h-3 w-16"></div>
                </div>
            </div>

            <div className='flex flex-col mt-16 text-xl text-slate-700'>
                <div className='flex items-start gap-3 border-y-2 border-slate-200 py-2'>
                    <GiHotMeal />
                    <div className="flex flex-col animate-pulse-fast bg-slate-300  h-6 w-16"></div>
                </div>
                <div className='flex items-center gap-3 border-b-2 border-slate-200 py-2'>
                    <MdOutlineRestaurant />
                    <div className="flex flex-col animate-pulse-fast bg-slate-300  h-6 w-24"></div>
                </div>
                <div className='flex items-center gap-3 border-b-2 border-slate-200 py-2'>
                    <FaUserFriends />
                    <div className="flex flex-col animate-pulse-fast bg-slate-300  h-6 w-16"></div>
                </div>
            </div>

            <div className='mt-16 w-full'>
                <div className='w-full h-8 flex gap-2 justify-center items-center border rounded-md bg-slate-700 animate-pulse-fast'></div>
            </div>
        </div>

      </div>

        <div className='flex flex-col gap-4 px-5 mt-20'>
          <h1 className='text-2xl font-bold text-slate-700 mb-2'>Recent Logs</h1>
          <div className='flex flex-col gap-5'>
            <SkeletonHomeMealCard />
          </div>
        </div>

        <div className="hidden md:block">
            <div className='bg-white pt-1 sticky top-[138px] rounded-md shadow-md overflow-hidden'>
                <div className='flex gap-2 items-center px-3 py-2'>
                    <div className="flex flex-col animate-pulse-fast bg-slate-400  h-6 w-32"></div>
                </div>
                <div className="flex items-center w-full border pl-3 pr-1 py-1">
                    <div className="flex flex-col animate-pulse-fast bg-slate-300  h-3 w-16"></div>
                    <div className="ml-auto">
                        <MdKeyboardArrowRight size={25}/>
                    </div>
                </div>
                <div className="flex items-center w-full border pl-3 pr-1 py-1">
                    <div className="flex flex-col animate-pulse-fast bg-slate-300  h-3 w-16"></div>
                    <div className="ml-auto">
                        <MdKeyboardArrowRight size={25}/>
                    </div>
                </div>
                <div className="flex items-center w-full border pl-3 pr-1 py-1">
                    <div className="flex flex-col animate-pulse-fast bg-slate-300  h-3 w-16"></div>
                    <div className="ml-auto">
                        <MdKeyboardArrowRight size={25}/>
                    </div>
                </div>
            </div>
      </div>
    </div>
  )
}

export default SkeletonProfile