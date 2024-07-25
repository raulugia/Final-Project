import React, { useEffect, useState} from 'react'
import { signOut } from "firebase/auth";
import {auth} from '../../utils/firebase'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import HomeMealCard from '../components/HomeMealCard';

const Home = () => {
  const user = auth.currentUser
  const [userData, setUserData] = useState(null)
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    (async() => {
      try {
        //get the id token
        const token = await user.getIdToken();
        const { data } = await axiosInstance.get("/api/home", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setUserData(data)
        console.log(data)
      } catch(err) {
        console.log(err)
      }
    })()
  }, [])

  //method to redirect user to "/" when they click on "log out" button
  // const handleClick = () => {
  //   //sign out user
  //   signOut(auth).then(() => {
  //     //redirect to "/"
  //     navigate("/")
  //   }).catch(e => console.error(e))
  // }
  return (
    // <div className="pt-20">
    //   <p>Welcome Home</p>
    //   <p className="cursor-pointer font-semibold" onClick={handleClick}>Log Out</p>
    // </div>
    <div className='flex justify-between min-h-screen pb-16 gap-4 bg-slate-200'>
      <div className="border bg-red-300 mt-24 flex-grow">
        left
      </div>

        <div className='flex-auto flex-col gap-4 py-6 px-10 mt-24 w-[85%] md:w-[25%] rounded-lg backdrop-blur-sm bg-white/30 shadow-lg ring-1 ring-slate-200'>
          <h1 className='text-2xl font-bold text-slate-700 mb-5'>Your Recent Logs</h1>
            {   
                loading ? (
                    <SkeletonMealCard />
                ) : (
                  <div className='py-4 px-5 rounded-md border shadow-sm max-w-[456px] bg-slate-200'>
                    <div className='min-w-full max-w-[415px] min-h-[300px] border'>
                        <img className='w-full' src="https://res.cloudinary.com/doqhgaraq/image/upload/v1721318652/hfmtoyfjuewrxac3b983.jpg" alt="" />
                    </div>
                    
                    <div>
                      <div className='flex justify-between items-center mt-2'>
                        <div className='leading-[18px]'>
                          <p className='text-md md:text-lg font-semibold'>Macarroni</p>
                          <p className='text-sm md:text-md text-gray-400'>Italian Restaurant</p>
                        </div>
                        <div>
                          <p>ACCURATE</p>
                        </div>
                      </div>
                    </div>

                    <div className='flex justify-end'>
                      <p className='text-sm text-gray-400'>Created at on</p>
                    </div>

                  </div>
                )
            }
        </div>

        <div className="border bg-red-300 mt-24 flex-grow">
            right
        </div>
    </div>
  )
}

export default Home