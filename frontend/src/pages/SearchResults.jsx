import React, {useState, useEffect} from 'react'
import { useLocation } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { auth } from '../../utils/firebase'
import SearchResultCard from '../components/SearchResultCard'
import SkeletonSearchResultCard from '../components/SkeletonSearchResultCard'
import UserCard from '../components/UserCard'
import { Link } from 'react-router-dom'
import { MdKeyboardArrowRight } from "react-icons/md";

const SearchResults = () => {
    const user = auth.currentUser
    const [meals, setMeals] = useState([])
    const [restaurants, setRestaurants] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const location = useLocation()
    
    useEffect(() => {
        (
            async() => {
                const token = await user.getIdToken();

                const params = new URLSearchParams(location.search)
                const query = params.get('query')

                const response = await axiosInstance.get(`/api/search?query=${query}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                console.log("RESPONSE: ",response.data)
                //setResults(response.data)
                setMeals(response.data[0].meals)
                setRestaurants(response.data[1].restaurants)
                setUsers(response.data[2].users)
                setLoading(false)
            }
        )()
    },[])

  return (
    <div className='flex flex-col min-h-screen pb-16 gap-4 bg-slate-200'>
        <h1 className='text-2xl font-semibold mt-20 mb-4 ml-[5%] text-slate-800'>Search Results</h1>
        {
            loading ? (
                <SkeletonSearchResultCard />
            ) : (

                <div className='flex flex-col gap-4 py-10 mx-auto w-[70%] rounded-lg backdrop-blur-sm bg-white/30 shadow-lg ring-1 ring-slate-200'>
                    <h2 className='text-xl font-semibold mb-1 mx-[15%] border-b-2 border-slate-800  pb-2 text-slate-800'>Meals</h2>
                    {   
                        meals.length > 0 ? (
                            meals.map(item => (
                                <SearchResultCard key={item.id+item.restaurantName} {...item}/>
                            ))
                        ) : (
                            <div className="shadow-md bg-slate-50 text-slate-800 w-[70%] mx-auto py-10 px-4 flex items-center rounded-lg">
                                <p>We couldn't find any matches for your search.</p>
                            </div>
                        )
                    }
                    <h2 className='text-xl font-semibold mt-4 mb-1 mx-[15%] border-b-2 border-slate-800 pb-2 text-slate-800'>Restaurants</h2>
                    {   
                        restaurants.length > 0 ? (
                            restaurants.map(item => (
                                <SearchResultCard key={item.id+item.restaurantName} {...item}/>
                            ))
                        ) : (
                            <div className="shadow-md bg-slate-50 text-slate-800 w-[70%] mx-auto py-10 px-4 flex items-center rounded-lg">
                                <p>We couldn't find any matches for your search.</p>
                            </div>
                        )
                    }
                    <h2 className='text-xl font-semibold mt-4 mb-1 mx-[15%] border-b-2 border-slate-800 pb-2 text-slate-800'>Users</h2>
                    {   
                        users.length > 0 ? (
                            users.map(user => (
                                <UserCard key={user.uid} {...user} />
                            ))
                        ) : (
                            <div className="shadow-md bg-slate-50 text-slate-800 w-[70%] mx-auto py-10 px-4 flex items-center rounded-lg">
                                <p>We couldn't find any matches for your search.</p>
                            </div>
                        )
                    }
                </div>
            )
        }
    </div>
  )
}

export default SearchResults