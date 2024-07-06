import React, { useEffect, useState} from 'react'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'
import SkeletonSearchResultCard from '../components/SkeletonSearchResultCard'
import { MdKeyboardArrowRight } from "react-icons/md";

const Restaurants = () => {
    const user = auth.currentUser
    const [restaurants, setRestaurants] = useState([])
    const [filteredRestaurants, setFilteredRestaurants] = useState([])
    //state to store the search input value
    const [searchInput, setSearchInput] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        (
            async() => {
                try{
                    //get the id token
                    const token = await user.getIdToken();

                    //make a get request to get the user's restaurants passing the id token for verification
                    const { data } = await axiosInstance.get("/api/restaurants", {
                        headers: {
                        Authorization: `Bearer ${token}`,
                        },
                    })

                    setRestaurants(data)
                    setFilteredRestaurants(data)
                    setLoading(false)
                } catch(err) {
                    console.log(err)
                }
            }
        )()
    }, [])

    //method triggered by typing in the search bar - filter restaurants
    const handleInputChange = (e) => {
        //store input value
        const searchValue = e.target.value
        //update state
        setSearchInput(searchValue)

        //if restaurants were found
        if(restaurants.length > 0) {
            //get the restaurants that match the search input
            const filtered = restaurants.filter(restaurant => {
                return `${restaurant.name}`.toLowerCase().includes(searchValue.toLowerCase())
            })

            //update state so the filtered restaurants are displayed
            setFilteredRestaurants(filtered)
        }
    }

  return (
    <div className='flex flex-col min-h-screen pb-16 gap-4 bg-slate-200'>
        <h1 className='text-2xl font-semibold mt-20 mb-4 ml-[5%] text-slate-800'>My Restaurants</h1>
        <div className='flex flex-col gap-4 py-10 mx-auto mt-5 w-[70%] rounded-lg backdrop-blur-sm bg-white/30 shadow-lg ring-1 ring-slate-200'>
            <form action="" className='absolute h-fit inset-0 mt-[-30px] mx-10'>
                <input type="search" name="" id="" value={searchInput} placeholder='Search for restaurants...' 
                    className='py-3 px-6 text-lg w-full rounded-full shadow-md'
                    onChange={handleInputChange}
                />
            </form>
            <div className='flex flex-col gap-4 mt-4'>
        {
            filteredRestaurants.length > 0 ? (
                filteredRestaurants.map(restaurant => (
                    <div key={restaurant.id+restaurant.name} className="shadow-md bg-slate-50 text-slate-800 w-[70%] mx-auto py-4 px-4 flex items-center justify-between gap-5 rounded-lg hover:cursor-pointer">
                        <div className='flex flex-col'>
                            <p className="text-xl font-semibold">{restaurant.name}</p>
                        </div>
                        <div>
                            <MdKeyboardArrowRight size={40} />
                        </div>
                    </div>
                ))
            ) : (
            
                <div className="shadow-md bg-slate-50 text-slate-800 w-[70%] mx-auto mt-4 py-10 px-4 flex items-center rounded-lg">
                    <p>We couldn't find any restaurants that match your search.</p>
                </div>
            )
        }
            </div>
    </div>
    </div>
  )
}

export default Restaurants