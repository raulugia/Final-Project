import React, { useState, useEffect } from 'react'
import { auth } from '../../utils/firebase'
import { updateEmail, updatePassword } from "firebase/auth";
import axiosInstance from '../../utils/axiosInstance'

const Account = () => {
    const user = auth.currentUser
    const [userData, setUserData] = useState({})
    const [dataToUpdate, setDataToUpdate] = useState({})
    const [loading, setLoading] = useState(true)

    useState(() => {
        (
            async() => {
                try{
                    const token = await user.getIdToken()

                    const { data } = await axiosInstance.get("/api/user-data", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })

                    if(data){
                        console.log(data)
                        setUserData(data)
                        setLoading(false)
                    }

                }catch(err){
                    console.log(err)
                }
            }
        )()
    },[])

    const handleSubmit = async(e) => {
        e.preventDefault()
        setLoading(true)
        try{
            const token = await user.getIdToken()
            if(dataToUpdate.email && dataToUpdate.email !== userData.email){
                await updateEmail(user, dataToUpdate.email)
            }
            
            if(dataToUpdate.password){

                await updatePassword(user, dataToUpdate.password)
            }

            const formData = new FormData()
            for(const key in dataToUpdate){
                formData.append(key, dataToUpdate[key])
            }

            if(file) {
                formData.append("picture", file)
            }

            const { data } = await axiosInstance.put("/api/update-user", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if(data){
                setUserData(data)
                setLoading(false)
            }
            

        }catch(err){
            console.log(err)
            setLoading(false)
        }
    }

    const handlePassword = e => {
        setDataToUpdate({...dataToUpdate, password: e.target.value})
    }

  return (
    <div className="min-h-screen flex justify-center items-start">
        <div className="pt-24 md:pt-28 w-[800px] mx-5">
            <form className="bg-white px-8 border rounded-xl shadow-md">
                <h1 className="text-lg font-semibold text-slate-700 mt-6">Manage Your Account</h1>
                <p className='text-sm text-slate-600 mb-6'>Click on the Save button to save your changes.</p>
                <div className="border-b-2 border-slate-200 w-full mb-6"></div>

                <div className="flex justify-between md:justify-start md:gap-16 items-center mb-6">
                    <div>
                        <div className="bg-slate-700 h-20 w-20 rounded-full"></div>
                    </div>
                    <div>
                        <button className="px-2 border bg-gray-100 text-sm rounded-lg py-1 font-semibold">Upload new picture</button>
                    </div>
                </div>

                <div className='w-full flex flex-col gap-3 mb-6'>
                    <div className="flex flex-col md:flex-row gap-3 md:gap-5 w-full">
                        <div className='w-full'>
                            <p className="text-sm font-semibold text-slate-600 mb-[0.5px]">Name</p>
                            <input 
                                type="text" 
                                className='border py-1 rounded-lg w-full shadow-sm px-2'
                                value={dataToUpdate.name ? dataToUpdate.name : userData.name}
                                onChange={(e) => setDataToUpdate({...dataToUpdate, name: e.target.value})}
                            />
                        </div>
                        <div className='w-full'>
                            <p className="text-sm font-semibold text-slate-600 mb-[0.5px]">Surname</p>
                            <input 
                                type="text" 
                                className='border py-1 rounded-lg w-full shadow-sm px-2' 
                                value={dataToUpdate.surname ? dataToUpdate.surname :userData.surname}
                                onChange={(e) => setDataToUpdate({...dataToUpdate, surname: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className='md:w-1/2 w-full pr-2'>
                        <p className="text-sm font-semibold text-slate-600 mb-[0.5px]">Username</p>
                        <input 
                            type="text" 
                            className='border py-1 rounded-lg w-full shadow-sm px-2' 
                            value={dataToUpdate.username ? dataToUpdate.username : userData.username}
                            onChange={(e) => setDataToUpdate({...dataToUpdate, username: e.target.value})}
                        />
                    </div>

                </div>

                <div className="border-b-2 border-slate-200 w-full mb-6"></div>
                
                <div className='mb-6'>
                    <h3 className='text-md font-semibold text-slate-700 mb-3'>Contact email</h3>
                    <div className='w-full'>
                        <p className="text-sm font-semibold text-slate-600 mb-[0.5px]">Email</p>
                        <input 
                            type="email" 
                            className='border py-1 rounded-lg w-full md:w-1/2 shadow-sm px-2 text-sm' 
                            value={dataToUpdate.email ? dataToUpdate.email : userData.email}
                            onChange={(e) => setDataToUpdate({...dataToUpdate, email: e.target.value})}
                        />
                    </div>
                </div>

                <div className="border-b-2 border-slate-200 w-full mb-6"></div>

                <div className='mb-6'>
                    <h3 className='text-md font-semibold text-slate-700 mb-3'>Password</h3>
                    <div className='flex w-full gap-2 md:gap-5'>
                        <div className='w-full'>
                            <p className="text-sm font-semibold text-slate-600 mb-[0.5px]">Current Password</p>
                            <input 
                                type="password" className='border py-1 rounded-lg w-full shadow-sm px-2'
                            />
                        </div>
                        <div className='w-full'>
                            <p className="text-sm font-semibold text-slate-600 mb-[0.5px]">New Password</p>
                            <input 
                                type="password" 
                                className='border py-1 rounded-lg w-full shadow-sm px-2'
                                onChange={handlePassword}
                            />
                        </div>
                    </div>
                </div>

                <div className="border-b-2 border-slate-200 w-full mb-6"></div>

                <div className="w-full flex gap-3 md:gap-5 mb-6 justify-center md:justify-end text-sm md:text-md">
                    <button 
                        disabled={loading}
                        onClick={handleSubmit} 
                        className="border border-blue-700 rounded-lg px-2 py-1 text-white font-semibold bg-blue-600 hover:bg-blue-700 hover:shadow-sm"
                    >
                            Save Changes
                    </button>
                    <button disabled={loading} className="border border-red-700 rounded-lg px-2 py-1 text-white font-semibold bg-red-600 hover:bg-red-700 hover:shadow-sm">Delete Account</button>
                </div>
                </form>
        </div>
    </div>
  )
}

export default Account