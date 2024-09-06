import React, { useEffect, useState} from 'react'
import { auth } from '../../utils/firebase'
import axiosInstance from '../../utils/axiosInstance'
import SkeletonRestaurantCard from '../components/SkeletonRestaurantCard';
import { MdKeyboardArrowRight } from "react-icons/md";
import { Link, useParams } from "react-router-dom"
import Error from '../components/Error'

//All the code in this file was written without assistance 

//component to display the restaurants linked to a user

const Restaurants = () => {
    //get current user
    const user = auth.currentUser
    //state to store restaurants
    const [restaurants, setRestaurants] = useState([])
    //state to store filtered restaurants
    const [filteredRestaurants, setFilteredRestaurants] = useState([])
    //state to store the search input value
    const [searchInput, setSearchInput] = useState("")
    const [loading, setLoading] = useState(true)
    const [hoveredRestaurant, setHoveredRestaurant] = useState(null)
    //get username - if it exists, other user's restaurants will be rendered
    //if it does not exist, current user's restaurants will be rendered
    const { username } = useParams()
    //state to store an error message
    const [error, setError] = useState("")

    useEffect(() => {
        (
            async() => {
                try{
                    setError("")
                    //get the id token
                    const token = await user.getIdToken();

                    //make a get request to get curren user's/other user's restaurants passing the id token for verification
                    const { data } = await axiosInstance.get(`${username ? `/api/user/${username}/restaurants` : "/api/restaurants"}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })

                    //update states
                    setRestaurants(data)
                    setFilteredRestaurants(data)
                    setLoading(false)
                } catch(err) {
                    //update state to display an error message
                    if(err.response && err.response.data && err.response.data.error){
                        setError(err.response.data.error)
                    } else {
                        setError("Failed to load restaurants. Please try again later.")
                    }
                } finally {
                    //hide loading state
                    setLoading(false)
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
                return restaurant.name.toLowerCase().includes(searchValue.toLowerCase())
            })

            //update state so the filtered restaurants are displayed
            setFilteredRestaurants(filtered)
        }
    }

  return (
    <div className='flex flex-col min-h-screen pb-16 gap-4 bg-slate-200'>
        {
            username ? (
                <h1 className='text-2xl font-semibold mt-20 mb-8 ml-[8%] text-slate-800'>@{username}'s Restaurants</h1>
            ) : (
                <h1 className='text-2xl font-semibold mt-20 mb-8 ml-[8%] text-slate-800'>My Restaurants</h1>
            )
        }
        
        <div className='flex flex-col gap-4 py-10 mx-auto mt-5 w-[85%] md:w-[70%] rounded-lg backdrop-blur-sm bg-white/30 shadow-lg ring-1 ring-slate-200'>
            <div action="" className='absolute h-fit inset-0 mt-[-30px] mx-5 md:mx-10'>
                <input type="search" name="" id="" value={searchInput} placeholder='Search for restaurants...' 
                    className='py-3 px-6 text-lg w-full rounded-full shadow-md'
                    onChange={handleInputChange}
                />
            </div>
            <div className='flex flex-col gap-4 mt-4'>
        {   
            filteredRestaurants.length > 0 && !loading ? (
                filteredRestaurants.map(restaurant => (
                    <Link to={username ? `/user/${username}/restaurants/${restaurant.id}` : `/my-restaurants/${restaurant.id}`} key={restaurant.id+restaurant.name}
                        onMouseEnter={() => setHoveredRestaurant(restaurant.id)} 
                        onMouseLeave={() => setHoveredRestaurant(null)} 
                        className={`shadow-md bg-slate-50 text-slate-800 w-[88%] md:w-[70%] mx-auto py-4 px-4 flex items-center justify-between gap-5 rounded-lg hover:cursor-pointer ${hoveredRestaurant === restaurant.id ? "underline" : ""}`}
                    >
                        <div className='flex flex-col'>
                            <p className="text-xl font-semibold">{restaurant.name}</p>
                        </div>
                        <div>
                            <MdKeyboardArrowRight size={40} />
                        </div>
                    </Link>
                ))
            ) :  filteredRestaurants.length <= 0 && !loading ?(
                error ? (
                    <div className="mx-8 mt-5">
                        <Error message={error} />
                    </div>
                ) : (
                    <div className="shadow-md bg-slate-50 text-slate-800 w-[70%] mx-auto mt-4 py-10 px-4 flex items-center rounded-lg">
                        <p>We couldn't find any restaurants that match your search.</p>
                    </div>
                )
            ) : (
                <SkeletonRestaurantCard />
            )
        }
        </div>
    </div>
    </div>
  )
}

export default Restaurants