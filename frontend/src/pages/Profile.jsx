import React, { useEffect, useState } from 'react'
import {auth} from '../../utils/firebase'
import CommonRestaurantCard from '../components/CommonRestaurantCard'

const Profile = () => {
  const user = auth.current
  const [restaurantsInCommon, setRestaurantsInCommon] = useState([])

  return (
    <div className='grid grid-cols-1 md:grid-cols-[1fr_1.4fr_1fr] min-h-screen pb-16 bg-slate-200'>
      <div className="border bg-red-300 hidden md:block">
        <div className='bg-white py-5 sticky top-32'>
          <p>This is goig to be updates</p>
        </div>
      </div>

        <div className='flex flex-col gap-4 px-5 mt-20'>
          <h1 className='text-2xl font-bold text-slate-700 mb-2'>Your Recent Logs</h1>
          <div className='flex flex-col gap-5'>
            {   
                loading ? (
                  <SkeletonHomeMealCard />
                ) : (
                  logs.map((log, index) => (
                    //ref will be assigned when the last HomeMealCard is rendered
                    <HomeMealCard key={log.logId} {...log} ref={index === logs.length - 1 ? lastLogRef: null}/>
                  ))
                )
            }
        </div>
        </div>

        <div className="hidden md:block">
          {
            restaurantsInCommon.length > 0 && (

              <div className='bg-white pt-1 sticky top-[138px] rounded-md shadow-md overflow-hidden'>
                <div className='flex gap-2 items-center px-3'>
                  <h1 className='text-lg text-slate-700 font-semibold mb-2 mt-1'>Restaurants in common</h1>
                </div>
                {
                  restaurantsInCommon.map(restaurant => (
                    <CommonRestaurantCard />
                  ))
                }
              </div>
            )
          }
      </div>
    </div>
  )
}

export default Profile