import React, {useState, useEffect} from 'react'
import { useLocation } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance'
import { auth } from '../../utils/firebase'
import SearchResultCard from '../components/SearchResultCard'

const SearchResults = () => {
    const user = auth.currentUser
    const [result, setResult] = useState([])
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

                setResult(response.data)
            }
        )()
    },[])

    result.length > 0 ? console.log(result) : ""
  return (
    <div className='flex flex-col'>
        <SearchResultCard />
    </div>
  )
}

export default SearchResults