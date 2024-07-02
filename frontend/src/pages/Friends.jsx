import React, {useEffect, useState} from 'react'
import axiosInstance from '../../utils/axiosInstance'
import { auth } from '../../utils/firebase'

const Friends = () => {
    const user = auth.currentUser
    const [userFriends, setUserFriends] = useState(null)

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
                    console.log(data)
                } catch(err) {
                    console.log(err)
                }
            }
        )()
    }, [])

  return (
    <div>Friends</div>
  )
}

export default Friends