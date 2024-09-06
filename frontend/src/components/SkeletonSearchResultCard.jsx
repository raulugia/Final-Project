import React from 'react'

//All the code in this file was written without assistance

//UI loading component

const SkeletonSearchResultCard = () => {
  return (
    <div className='flex flex-col gap-4 py-10 mx-auto w-[88%] md:w-[70%] rounded-lg backdrop-blur-sm bg-white/40 shadow-lg'>
        <div className="shadow-md bg-white text-slate-800 w-[88%] md:w-[70%] h-[190px] mx-auto py-4 md:px-4 flex gap-6 md:gap-10 rounded-lg">
          <div className="md:w-[30%] animate-pulse-fast ">
            <div className="rounded bg-slate-300 w-full h-full"></div>
          </div>
          <div className="flex flex-col justify-between">

            <div className="animate-pulse-fast  flex flex-col justify-start items-start gap-1">
             <div className="rounded bg-slate-300 h-5 w-40 "></div>
             <div className="rounded bg-slate-300 h-3 w-20"></div>
            </div>

            <div className="animate-pulse-fast flex flex-col justify-start items-start gap-1">
                <div className="rounded bg-slate-300 h-4 w-32"></div>
                <div className="rounded bg-slate-300 h-6 w-20"></div>
            </div>

            <div className="animate-pulse-fast flex flex-col justify-start items-start">
                <div className="rounded bg-slate-300 h-2 w-48 mb-[3px]"></div>
                <div className="rounded bg-slate-300 h-2 w-32"></div>
            </div>
          </div>
        </div>
        <div className="shadow-md bg-white text-slate-800 w-[88%] md:w-[70%] h-[190px] mx-auto py-4 md:px-4 flex gap-6 md:gap-10 rounded-lg">
          <div className="md:w-[30%] animate-pulse-fast ">
            <div className="rounded bg-slate-300 w-full h-full"></div>
          </div>
          <div className="flex flex-col justify-between">

            <div className="animate-pulse-fast  flex flex-col justify-start items-start gap-1">
             <div className="rounded bg-slate-300 h-5 w-40 "></div>
             <div className="rounded bg-slate-300 h-3 w-20"></div>
            </div>

            <div className="animate-pulse-fast flex flex-col justify-start items-start gap-1">
                <div className="rounded bg-slate-300 h-4 w-32"></div>
                <div className="rounded bg-slate-300 h-6 w-20"></div>
            </div>

            <div className="animate-pulse-fast flex flex-col justify-start items-start">
                <div className="rounded bg-slate-300 h-2 w-48 mb-[3px]"></div>
                <div className="rounded bg-slate-300 h-2 w-32"></div>
            </div>
          </div>
        </div>
        <div className="shadow-md bg-white text-slate-800 w-[88%] md:w-[70%] h-[190px] mx-auto py-4 md:px-4 flex gap-6 md:gap-10 rounded-lg">
          <div className="md:w-[30%] animate-pulse-fast ">
            <div className="rounded bg-slate-300 w-full h-full"></div>
          </div>
          <div className="flex flex-col justify-between">

            <div className="animate-pulse-fast  flex flex-col justify-start items-start gap-1">
             <div className="rounded bg-slate-300 h-5 w-40 "></div>
             <div className="rounded bg-slate-300 h-3 w-20"></div>
            </div>

            <div className="animate-pulse-fast flex flex-col justify-start items-start gap-1">
                <div className="rounded bg-slate-300 h-4 w-32"></div>
                <div className="rounded bg-slate-300 h-6 w-20"></div>
            </div>

            <div className="animate-pulse-fast flex flex-col justify-start items-start">
                <div className="rounded bg-slate-300 h-2 w-48 mb-[3px]"></div>
                <div className="rounded bg-slate-300 h-2 w-32"></div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default SkeletonSearchResultCard