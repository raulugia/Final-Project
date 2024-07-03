import React, {useState, useEffect} from 'react'
import { useLocation } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { auth } from '../../utils/firebase'
import SearchResultCard from '../components/SearchResultCard'

const SearchResults = () => {
    const user = auth.currentUser
    const [results, setResults] = useState([])
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

                setResults(response.data)
            }
        )()
    },[])

    results.length > 0 ? console.log(results) : ""
  return (
    <div className='flex flex-col gap-4'>
        <h1 className='text-2xl font-semibold mt-8 ml-[5%]'>Search Results</h1>
        <h2 className='text-xl font-semibold mt-4 ml-[25%]'>Meals</h2>
        {
            results.map(item => (
                <SearchResultCard key={item.id+item.restaurantName} {...item}/>
            ))
        }
    </div>
  )
}

export default SearchResults