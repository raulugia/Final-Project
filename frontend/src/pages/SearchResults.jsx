import React, {useState, useEffect} from 'react'
import { useLocation } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { auth } from '../../utils/firebase'
import SearchResultCard from '../components/SearchResultCard'
import SkeletonSearchResultCard from '../components/SkeletonSearchResultCard'

const SearchResults = () => {
    const user = auth.currentUser
    const [meals, setMeals] = useState([])
    const [restaurants, setRestaurants] = useState([])
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
                console.log(response.data)
                //setResults(response.data)
                setMeals(response.data[0].meals)
                setRestaurants(response.data[1].restaurants)
                setLoading(false)
            }
        )()
    },[])

  return (
    <div className='flex flex-col h-screen gap-4 bg-gradient-to-br from-slate-300 via-slate-400 to-slate-500'>
        <h1 className='text-2xl font-semibold mt-20 mb-5 ml-[5%] text-slate-800'>Search Results</h1>
        {
            loading ? (
                <SkeletonSearchResultCard />
            ) : (

                <div className='flex flex-col gap-4 py-10 mx-auto w-[60%] rounded-lg backdrop-blur-sm bg-white/40 shadow-lg'>
                    <h2 className='text-xl font-semibold mb-1 mx-[15%] border-b-2 border-slate-800  pb-2 text-slate-800'>Meals</h2>
                    {
                        meals.map(item => (
                            <SearchResultCard key={item.id+item.restaurantName} {...item}/>
                        ))
                    }
                    <h2 className='text-xl font-semibold mt-4 mb-1 mx-[15%] border-b-2 border-slate-800 pb-2 text-slate-800'>Restaurants</h2>
                    {
                        restaurants.map(item => (
                            <SearchResultCard key={item.id+item.restaurantName} {...item}/>
                        ))
                    }
                </div>
            )
        }
    </div>
  )
}

export default SearchResults