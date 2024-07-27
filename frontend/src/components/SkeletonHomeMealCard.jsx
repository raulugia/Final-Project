import React from 'react'

const SkeletonHomeMealCard = () => {
  return (
    <>
    <div className='py-4 px-5 rounded-md border border-slate-200 shadow-md max-w-[456px] bg-white'>

        <div className='animate-pulse-fast min-w-full max-w-[415px] min-h-[370px] rounded-md overflow-hidden bg-slate-700'></div>
        
        <div className='mt-4'>
            <div className='flex justify-between items-center'>
                <div className='flex flex-col gap-2'>
                    <div className='animate-pulse-fast bg-slate-300  h-5 w-28'></div>
                    <div className='animate-pulse-fast bg-slate-300  h-3 w-16'></div>
                </div>
                <div>
                    <div className='animate-pulse-fast bg-slate-300  h-5 w-20'></div>
                </div>
            </div>
        </div>

        <div className='flex justify-end mt-2'>
            <div className='animate-pulse-fast bg-slate-300  h-3 w-36'></div>
        </div>

    </div>
    
    <div className='py-4 px-5 rounded-md border border-slate-200 shadow-md max-w-[456px] bg-white'>

        <div className='animate-pulse-fast min-w-full max-w-[415px] min-h-[370px] rounded-md overflow-hidden bg-slate-700'></div>
        
        <div className='mt-4'>
            <div className='flex justify-between items-center'>
                <div className='flex flex-col gap-2'>
                    <div className='animate-pulse-fast bg-slate-300  h-5 w-28'></div>
                    <div className='animate-pulse-fast bg-slate-300  h-3 w-16'></div>
                </div>
                <div>
                    <div className='animate-pulse-fast bg-slate-300  h-5 w-20'></div>
                </div>
            </div>
        </div>

        <div className='flex justify-end mt-2'>
            <div className='animate-pulse-fast bg-slate-300  h-3 w-36'></div>
        </div>

    </div>

    <div className='py-4 px-5 rounded-md border border-slate-200 shadow-md max-w-[456px] bg-white'>

        <div className='animate-pulse-fast min-w-full max-w-[415px] min-h-[370px] rounded-md overflow-hidden bg-slate-700'></div>
        
        <div className='mt-4'>
            <div className='flex justify-between items-center'>
                <div className='flex flex-col gap-2'>
                    <div className='animate-pulse-fast bg-slate-300  h-5 w-28'></div>
                    <div className='animate-pulse-fast bg-slate-300  h-3 w-16'></div>
                </div>
                <div>
                    <div className='animate-pulse-fast bg-slate-300  h-5 w-20'></div>
                </div>
            </div>
        </div>

        <div className='flex justify-end mt-2'>
            <div className='animate-pulse-fast bg-slate-300  h-3 w-36'></div>
        </div>

    </div>
    </>
  )
}

export default SkeletonHomeMealCard