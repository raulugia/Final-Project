import React, {useState, useEffect} from 'react'
import { useLocation } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { auth } from '../../utils/firebase'
import SearchResultCard from '../components/SearchResultCard'
import SkeletonSearchResultCard from '../components/SkeletonSearchResultCard'
import UserCard from '../components/UserCard'

const SearchResults = () => {
    //get current user
    const user = auth.currentUser
    //states to store the returned data
    const [meals, setMeals] = useState([])
    const [restaurants, setRestaurants] = useState([])
    const [users, setUsers] = useState([])
    //state to show/hide loading skeleton
    const [loading, setLoading] = useState(true)
    //state to store the location - needed to get the query and to trigger the useEffect when the query changes
    const location = useLocation()
    //state to display errors
    const [error, setError] = useState("")
    
    //fetch restaurants, users, meals
    useEffect(() => {
        (
            async() => {
                try{
                setLoading(true)
                //get token for server verification
                const token = await user.getIdToken();

                //get the query
                const params = new URLSearchParams(location.search)
                const query = params.get('query')

                //sent a get request to the api
                const response = await axiosInstance.get(`/api/search?query=${query}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                
                //update states to display data
                setMeals(response.data[0].meals)
                setRestaurants(response.data[1].restaurants)
                setUsers(response.data[2].users)
                //hide loading skeleton
                setLoading(false)
                }catch(err) {
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
    },[location.search])

  return (
    <div className='flex flex-col min-h-screen pb-16 gap-4 bg-slate-200'>
        <h1 className='text-2xl font-semibold mt-20 mb-4 ml-[5%] text-slate-800'>Search Results</h1>
        {
            loading ? (
                <SkeletonSearchResultCard />
            ) : (

                <div className='flex flex-col gap-4 py-10 mx-auto w-[88%] md:w-[70%] rounded-lg backdrop-blur-sm bg-white/30 shadow-lg ring-1 ring-slate-200'>
                    {
                        error ? (
                            <div className="mx-6 border border-red-700 bg-red-100 text-red-900 py-3 rounded-md px-3">
                                <p>error</p>
                            </div>
                        ) : (
                            <>
                            <h2 className='text-xl font-semibold mb-1 mx-7 md:mx-[15%] border-b-2 border-slate-800  pb-2 text-slate-800'>Meals</h2>
                            {   
                                meals.length > 0 ? (
                                    meals.map(item => (
                                        <SearchResultCard key={item.id+item.restaurantName} {...item}/>
                                    ))
                                ) : (
                                    <div className="shadow-md bg-slate-50 text-slate-800 w-[88%] md:w-[70%] mx-auto py-10 px-4 flex items-center rounded-lg">
                                        <p>We couldn't find any matches for your search.</p>
                                    </div>
                                )
                            }
                            <h2 className='text-xl font-semibold mt-4 mb-1 mx-7 md:mx-[15%] border-b-2 border-slate-800 pb-2 text-slate-800'>Restaurants</h2>
                            {   
                                restaurants.length > 0 ? (
                                    restaurants.map(item => (
                                        <SearchResultCard key={item.id+item.restaurantName} {...item}/>
                                    ))
                                ) : (
                                    <div className="shadow-md bg-slate-50 text-slate-800 w-[88%] md:w-[70%] mx-auto py-10 px-4 flex items-center rounded-lg">
                                        <p>We couldn't find any matches for your search.</p>
                                    </div>
                                )
                            }
                            <h2 className='text-xl font-semibold mt-4 mb-1 mx-7 md:mx-[15%] border-b-2 border-slate-800 pb-2 text-slate-800'>Users</h2>
                            {   
                                users.length > 0 ? (
                                    users.map(user => (
                                        <UserCard key={user.uid} {...user} />
                                    ))
                                ) : (
                                    <div className="shadow-md bg-slate-50 text-slate-800 w-[88%] md:w-[70%] mx-auto py-10 px-4 flex items-center rounded-lg">
                                        <p>We couldn't find any matches for your search.</p>
                                    </div>
                                )
                            }
                            </>
                        )
                    }
                </div>
            )
        }
    </div>
  )
}

export default SearchResults