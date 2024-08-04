import React from 'react'

const Account = ({name, surname, username, email}) => {
  return (
    <div className="min-h-screen flex justify-center items-start">
        <div className="pt-28 w-[800px]">
            <form className="bg-white px-8 border rounded-xl shadow-md">
                <h1 className="text-lg font-semibold text-slate-700 mt-6">Manage Your Account</h1>
                <p className='text-sm text-slate-600 mb-6'>Click on the Save button to save your changes.</p>
                <div className="border-b-2 border-slate-200 w-full mb-6"></div>

                <div className="flex justify-start gap-16 items-center mb-6">
                    <div>
                        <div className="bg-slate-700 h-20 w-20 rounded-full"></div>
                    </div>
                    <div>
                        <button className="px-2 border text-sm rounded-lg py-1 font-semibold">Upload new picture</button>
                    </div>
                </div>

                <div className='w-full flex flex-col gap-3 mb-6'>
                    <div className="flex gap-5 w-full">
                        <div className='w-full'>
                            <p className="text-sm font-semibold text-slate-600 mb-[0.5px]">Name</p>
                            <input type="text" className='border py-1 rounded-lg w-full shadow-sm px-2'/>
                        </div>
                        <div className='w-full'>
                            <p className="text-sm font-semibold text-slate-600 mb-[0.5px]">Surname</p>
                            <input type="text" className='border py-1 rounded-lg w-full shadow-sm px-2'/>
                        </div>
                    </div>
                    <div className='w-1/2 pr-2'>
                        <p className="text-sm font-semibold text-slate-600 mb-[0.5px]">Username</p>
                        <input type="text" className='border py-1 rounded-lg w-full shadow-sm px-2'/>
                    </div>

                </div>

                <div className="border-b-2 border-slate-200 w-full mb-6"></div>
                
                <div className='mb-6'>
                    <h3 className='text-md font-semibold text-slate-700 mb-3'>Contact email</h3>
                    <div>
                        <p className="text-sm font-semibold text-slate-600 mb-[0.5px]">Email</p>
                        <input type="email" className='border py-1 rounded-lg w-1/2 shadow-sm px-2'/>
                    </div>
                </div>

                <div className="border-b-2 border-slate-200 w-full mb-6"></div>

                <div className='mb-6'>
                    <h3 className='text-md font-semibold text-slate-700 mb-3'>Contact email</h3>
                    <div className='flex w-full gap-5'>
                        <div className='w-full'>
                            <p className="text-sm font-semibold text-slate-600 mb-[0.5px]">Current Password</p>
                            <input type="password" className='border py-1 rounded-lg w-full shadow-sm px-2'/>
                        </div>
                        <div className='w-full'>
                            <p className="text-sm font-semibold text-slate-600 mb-[0.5px]">New Password</p>
                            <input type="password" className='border py-1 rounded-lg w-full shadow-sm px-2'/>
                        </div>
                    </div>
                </div>

                <div className="border-b-2 border-slate-200 w-full mb-6"></div>

                <div className="w-full flex gap-5 mb-6 justify-end">
                    <button className="border border-blue-700 rounded-lg px-2 py-1 text-white font-semibold bg-blue-600 hover:bg-blue-700 hover:shadow-sm">Save Changes</button>
                    <button className="border border-red-700 rounded-lg px-2 py-1 text-white font-semibold bg-red-600 hover:bg-red-700 hover:shadow-sm">Delete Account</button>
                </div>
                </form>
        </div>
    </div>
  )
}

export default Account