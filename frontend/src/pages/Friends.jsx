import React, {useEffect, useState} from 'react'
import axiosInstance from '../../utils/axiosInstance'
import { auth } from '../../utils/firebase'

const Friends = () => {
    const user = auth.currentUser
    const [userFriends, setUserFriends] = useState([])
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

    if(loading) {
        return <p>Loading...</p>
    }

  return (
   <div>
    {
        userFriends.length > 0 ? (
            <p>{userFriends[0].name}</p>
        ) : (
            <p>No Friends</p>
        )
    }
   </div>
  )
}

export default Friends