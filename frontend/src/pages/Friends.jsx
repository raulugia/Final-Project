import React, {useEffect, useState} from 'react'
import axiosInstance from '../../utils/axiosInstance'
import { auth } from '../../utils/firebase'

const Friends = () => {
    const user = auth.currentUser
    const [userFriends, setUserFriends] = useState([])
    const [filteredFriends, setFilteredFriends] = useState([])
    const [searchInput, setSearchInput] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        (
            async() => {
                try {
                    //get the id token
                    const token = await user.getIdToken();
                    const { data } = await axiosInstance.get("/api/friends", {
                        headers: {
                        Authorization: `Bearer ${token}`,
                        },
                    })

                    setUserFriends(data)
                    setLoading(false)
                    console.log(data)
                } catch(err) {
                    console.log(err)
                }
            }
        )()
    }, [])

    const handleInputChange = (e) => {
        const searchValue = e.target.value
        setSearchInput(searchValue)

        if(userFriends.length > 0) {
            const filtered = userFriends.filter(friend => {
                `${friend.name} ${friend.surname}`.toLowerCase().includes(searchValue.toLowerCase())
            })

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
        <form action="" className='absolute inset-0 mt-[-30px] mx-10'>
            <input type="search" name="" id="" value={searchInput} placeholder='Search for friends...' 
                className='py-3 px-6 text-lg w-full rounded-full shadow-md'
                onChange={handleInputChange}
            />
        </form>
    {
        userFriends.length > 0 ? (
            <p>{userFriends[0].name}</p>
        ) : (
           
                <div className="shadow-md bg-slate-50 text-slate-800 w-[70%] mx-auto mt-4 py-10 px-4 flex items-center rounded-lg">
                    <p>We couldn't find any friends that match your search.</p>
                </div>
        )
        }
    </div>
   </div>
  )
}

export default Friends