import React, {useEffect, useState} from 'react'
import axiosInstance from '../../utils/axiosInstance'
import { auth } from '../../utils/firebase'
import FriendCard from '../components/FriendCard'
import { useParams } from 'react-router-dom'
import Error from '../components/Error'


const Friends = () => {
    //get current user
    const user = auth.currentUser
    //state to store all the user friends
    const [userFriends, setUserFriends] = useState([])
    //state to store all the friends on first render and filtered friends when the search bar is used
    const [filteredFriends, setFilteredFriends] = useState([])
    //state to store the search input value
    const [searchInput, setSearchInput] = useState("")
    //state to track when content is being loaded
    const [loading, setLoading] = useState(true)
    //get username - if it exists, other user's friends will be rendered
    //if it does not exist, current user's friends will be rendered
    const { username } = useParams()
    //state to store an error message
    const [error, setError] = useState("")

    //get the user's friends
    useEffect(() => {
        (
            async() => {
                try {
                    //get the id token
                    const token = await user.getIdToken();

                    //make a get request to get current user's/other user's friends passing the id token for verification
                    const { data } = await axiosInstance.get(`${username ? `/api/user/${username}/friends` : "/friends"}`, {
                        headers: {
                        Authorization: `Bearer ${token}`,
                        },
                    })

                    //update states
                    setUserFriends(data)
                    setFilteredFriends(data)
                    setLoading(false)
                } catch(err) {
                    //update state to display an error message
                    if(err.response && err.response.data && err.response.data.error){
                        setError(err.response.data.error)
                    } else {
                        setError("Failed to load friends. Please try again later.")
                    }
                } finally {
                    //hide loading state
                    setLoading(false)
                }
            }
        )()
    }, [])

    //method triggered by typing in the search bar - filter friends
    const handleInputChange = (e) => {
        //store input value
        const searchValue = e.target.value
        //update state
        setSearchInput(searchValue)

        //if friends were found
        if(userFriends.length > 0) {
            //get the friends that match the search input
            const filtered = userFriends.filter(friend => {
                return `${friend.name} ${friend.surname} ${friend.username}`.toLowerCase().includes(searchValue.toLowerCase())
            })

            //update state so the filtered friends are displayed
            setFilteredFriends(filtered)
        }
    }

    if(loading) {
        return <p>Loading...</p>
    }

  return (
   <div className='flex flex-col min-h-screen pb-16 gap-4 bg-slate-200 pt-20'>
    <h1 className='text-2xl font-semibold mb-4 ml-[5%] text-slate-800'>Friends</h1>
    <div className='flex flex-col gap-4 py-10 mx-auto w-[70%] rounded-lg backdrop-blur-sm bg-white/30 shadow-lg ring-1 ring-slate-200'>
        <form action="" className='absolute h-fit inset-0 mt-[-30px] mx-10'>
            <input type="search" name="" id="" value={searchInput} placeholder='Search for friends...' 
                className='py-3 px-6 text-lg w-full rounded-full shadow-md'
                onChange={handleInputChange}
            />
        </form>
    {
        filteredFriends.length > 0 ? (
            filteredFriends.map(friend => (
                <FriendCard name={friend.name} surname={friend.surname} username={friend.username} key={friend.id+friend.name}/>
            ))
        ) : (

            error ? (
                <div className="mx-8 mt-5">
                    <Error message={error} />
                </div>
            ) : (
                <div className="shadow-md bg-slate-50 text-slate-800 w-[70%] mx-auto mt-4 py-10 px-4 flex items-center rounded-lg">
                    <p>We couldn't find any friends that match your search.</p>
                </div>
            )
           
        )
        }
    </div>
   </div>
  )
}

export default Friends